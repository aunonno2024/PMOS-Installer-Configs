#!/usr/bin/env -S node --loader ts-node/esm

/*

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

import { readdirSync, readFileSync } from "fs";
import * as path from "path";
import * as YAML from "yaml";

/** array of schemas */
export const schemas = readdirSync(path.join(__dirname, "v2/schema"))
 .map(file => readFileSync(path.join(__dirname, "v2/schema/", file), "utf-8"))
 .map(schema => YAML.parse(schema));
