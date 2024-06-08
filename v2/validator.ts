/*
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import semver from "semver";
import Ajv, { FuncKeywordDefinition, JSONSchemaType } from "ajv/dist/2020.js";
import type { PMOSInstallerConfig, Step, Action } from "../lib/schema";
import { schemas } from "./schemas.js";

export type { PMOSInstallerConfig, Step, Action } from "../lib/schema";

/** get all actions used in a series of steps */
const deconstructSteps = (steps: Step[]): Action[] =>
  steps
    .map(({ actions, fallback }) => [...(actions || []), ...(fallback || [])])
    .flat()
    .map(a => (a["core:group"] ? deconstructSteps(a["core:group"]) : a))
    .flat();

/** get all actions used in a config */
const getActions = (config: PMOSInstallerConfig): Action[] =>
  deconstructSteps([
    ...Object.entries(config?.handlers || {}).map(s => s[1]),
    ...config.operating_systems.map(({ steps }) => steps).flat()
  ]);

const keywords: FuncKeywordDefinition[] = [
  /** ensure a user_action string is a valid reference */
  {
    keyword: "pmos_user-action",
    type: "string",
    compile: () => (action, { rootData }) => rootData.user_actions[action],
    error: {
      message: "undefined user_action"
    }
  },

  /** ensure a user_action is not already specified in the devices unlock block */
  {
    keyword: "pmos_not-in-unlock",
    type: "string",
    compile: () => (action, { rootData }) => !(rootData?.unlock?.indexOf(action) !== -1),
    error: {
      message: "unlock and operating_systems.prerequisites should be mutually exclusive"
    }
  },

  /** ensure a user_action is used somewhere */
  {
    keyword: "pmos_no-unused-user_actions",
    type: "object",
    compile: () => (_, { rootData, parentDataProperty: action }) =>
      rootData?.unlock?.indexOf(action) !== -1 ||
      rootData?.operating_systems?.reduce(
        (prev, { prerequisites }) => prev || prerequisites?.indexOf(action) !== -1,
        false
      ) ||
      getActions(rootData).filter(a => a["core:user_action"]?.action === action).length,
    error: {
      message: "no unused user_actions"
    }
  },

  /** ensure a semver string is a valid reference */
  {
    keyword: "pmos_semver",
    type: "string",
    compile: () => data => semver.validRange(data, { loose: true }),
    error: {
      message: "invalid semver range"
    }
  },

  /** ensure the compatible_installer specified for the operating_system satisfies every action */
  {
    keyword: "pmos_installer-compatibility",
    compile: required_by_action => (_, { rootData, instancePath }) =>
      !instancePath.startsWith("/operating_systems/") ||
      semver.subset(
        rootData.operating_systems[
          instancePath.split("/operating_systems/")[1].split("/")[0]
        ].compatible_installer,
        required_by_action,
        { loose: true, includePrerelease: true }
      ),
    error: ({ schema }) => `requires compatible_installer ${schema}`,
    metaSchema: {
      type: "string",
      pmos_semver: null
    }
  }
];

const ajv = new Ajv({
  keywords,
  schemas,
  strict: true,
  allErrors: true,
  strictSchema: true
});

export const validate = ajv.compile(schemas[0] as JSONSchemaType<PMOSInstallerConfig>);

export default validate;
