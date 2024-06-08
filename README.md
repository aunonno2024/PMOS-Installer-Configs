# PMOS-Installer-Configs

This repository contains the configs files for [PMOS Installer](https://github.com/aunonno2024/PMOS-Installer) devices.

Devices are configured using [YAML](https://yaml.org/) files following the [schema specifcation](./v2/schema/_.schema.yml) in the [./v2/devices](./v2/devices) directory.

If you want to propose changes to the structure or propose a new action, open an [issue](https://github.com/aunonno2024/PMOS-Installer-Configs/issues/new). Device-specific installation issues should be filed directly against the [PMOS Installer's repository](https://github.com/aunonno2024/PMOS-Installer/issues/new).

## Contributing

If you want to add a or improve a device, run `npm run build && npm run validate` to make sure your file follows the specification and `npm run lint` to make it pretty. You can use `npm run checksemver` to validate semver strings and `npm run checkdownloads` to make sure all files download successfully. If you modify any specifications, use `npm run test` to run specification validation tests.

You can use your local config file with the [PMOS Installer](https://github.com/aunonno2024/PMOS-Installer) by supplying the `--file` or `-f` flag:
