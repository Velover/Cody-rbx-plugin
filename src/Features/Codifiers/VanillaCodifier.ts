import { InstanceAST } from "../InstanceAST/InstanceAST";
import { TsValueCodifying } from "../ValueCodifying/TsValueCodifying";

export namespace VanillaCodifier {
	export function Codify(ast: InstanceAST.IInstanceAST): string {
		if (ast.Roots.size() === 0) return "[]";
		const registry = ast.Registry;
		const roots = ast.Roots.map((id) => registry.get(id)!);
		for (const root of roots) {
			if (!root.IsCreatable) {
				return `// ${root.ClassName} is not creatable`;
			}
		}

		const node_property_exceptions_map = new Map<number, string[]>();

		for (const [, node] of registry) {
			const property_name_exceptions: string[] = [
				"Parent",
				"Source",
				"TextureContent",
				"ImageContent",
			];
			node_property_exceptions_map.set(node.Id, property_name_exceptions);

			for (const diff_property_name of node.DifferentProperties) {
				const property_data = node.Properties.get(diff_property_name)!;
				if (property_data.Readonly) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (property_data.Value === undefined) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (
					diff_property_name === "BackgroundColor3" &&
					node.Properties.get("BackgroundTransparency")?.Value === 1
				) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (
					diff_property_name === "BorderColor3" &&
					node.Properties.get("BorderSizePixel")?.Value === 0
				) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}
			}
		}

		const result: string[] = [];

		for (const root_id of ast.Roots) {
			const root_node = registry.get(root_id)!;
			result.push(NodeToCode(root_node, registry, node_property_exceptions_map, false));
		}

		return result.join("");
	}

	const RESERVED_WORDS = new Set([
		"break",
		"case",
		"catch",
		"continue",
		"debugger",
		"default",
		"delete",
		"do",
		"else",
		"finally",
		"for",
		"function",
		"if",
		"in",
		"instanceof",
		"new",
		"return",
		"switch",
		"this",
		"throw",
		"try",
		"typeof",
		"var",
		"void",
		"while",
		"with",
		"class",
		"const",
		"enum",
		"export",
		"extends",
		"import",
		"super",
		"implements",
		"interface",
		"let",
		"package",
		"private",
		"protected",
		"public",
		"static",
		"yield",
		"null",
		"true",
		"false",
		"undefined",
		"NaN",
		"Infinity",
		"abstract",
		"as",
		"boolean",
		"byte",
		"char",
		"double",
		"final",
		"float",
		"goto",
		"int",
		"long",
		"native",
		"short",
		"synchronized",
		"throws",
		"transient",
		"volatile",
		"number",
		"string",
		"type",
		"namespace",
		"module",
		"declare",
		"from",
		// roblox-ts / Luau reserved identifiers
		"math",
		"table",
		"task",
		"bit32",
		"coroutine",
		"debug",
		"os",
		"string",
		"utf8",
		"buffer",
		"vector",
	]);

	function SanitizeName(name: string): string {
		let sanitized = name.gsub("[^%w]", "")[0];
		if (sanitized === "") return "inst";
		const firstChar = sanitized.sub(1, 1);
		if (firstChar.match("%d")[0] !== undefined) {
			sanitized = "inst" + sanitized;
		}
		if (RESERVED_WORDS.has(sanitized)) {
			sanitized = sanitized + "_";
		}
		return sanitized;
	}

	function MakeUniqueName(baseName: string, usedNames: Set<string>): string {
		if (!usedNames.has(baseName)) {
			usedNames.add(baseName);
			return baseName;
		}
		let counter = 2;
		while (usedNames.has(`${baseName}_${counter}`)) {
			counter += 1;
		}
		const uniqueName = `${baseName}_${counter}`;
		usedNames.add(uniqueName);
		return uniqueName;
	}

	function NodeToCode(
		node: InstanceAST.IInstanceNode,
		registry: Map<number, InstanceAST.IInstanceNode>,
		property_exceptions_map: Map<number, string[]>,
		isChild: boolean,
		parentVarName?: string,
		siblingNames?: Set<string>,
	): string {
		const name = node.Properties.get("Name")!.Value as string;
		const baseName = SanitizeName(name);

		const usedNames = siblingNames ?? new Set<string>();
		const varName = MakeUniqueName(baseName, usedNames);

		const property_exceptions = property_exceptions_map.get(node.Id)!;

		const result: string[] = [];

		// Create instance
		if (isChild && parentVarName !== undefined) {
			result.push(`const ${varName} = new Instance("${node.ClassName}", ${parentVarName});`);
		} else {
			result.push(`const ${varName} = new Instance("${node.ClassName}");`);
		}

		// Assign properties
		for (const prop_name of node.DifferentProperties) {
			if (property_exceptions.includes(prop_name)) continue;

			const prop_data = node.Properties.get(prop_name)!;
			const prop_value = TsValueCodifying.Codify(prop_data.Value);

			result.push(`${varName}.${prop_name} = ${prop_value};`);
		}

		// Process children — all in one shared scope block
		if (node.ChildrenIds.size() > 0) {
			result.push("{");
			const childUsedNames = new Set<string>([varName]);
			let firstChild = true;
			for (const child_id of node.ChildrenIds) {
				if (!firstChild) result.push("\n\n");
				firstChild = false;
				const child_node = registry.get(child_id)!;
				result.push(
					NodeToCode(child_node, registry, property_exceptions_map, true, varName, childUsedNames),
				);
			}
			result.push("}");
		}

		return result.join("");
	}
}
