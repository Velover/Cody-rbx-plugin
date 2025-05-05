export namespace TsValueCodifying {
	export function Codify(v: unknown): string {
		const v_type = typeOf(v);
		if (v_type === "string") {
			const value = v as string;
			return `"${value.gsub('"', "'")[0]}"`;
		} else if (v_type === "number") {
			const value = v as number;
			if (v === math.huge) return "math.huge";
			if (v === -math.huge) return "-math.huge";
			if (v !== v) return "0/0";

			const has_floating_point = math.modf(value)[1] !== 0;
			if (has_floating_point) return `${"%.4f".format(value)}`;
			return `${value}`;
		} else if (v_type === "boolean") {
			return v ? "true" : "false";
		} else if (v_type === "Axes") {
			const value = v as Axes;
			const axes: Enum.Axis[] = [];
			if (value.X) {
				axes.push(Enum.Axis.X);
			}
			if (value.Y) {
				axes.push(Enum.Axis.Y);
			}
			if (value.Z) {
				axes.push(Enum.Axis.Z);
			}
			return `new Axes(${axes.map((axis) => `Enum.Axis.${axis.Name}`).join(", ")})`;
		} else if (v_type === "Vector3") {
			const value = v as Vector3;
			return `new Vector3(${Codify(value.X)}, ${Codify(value.Y)}, ${Codify(value.Z)})`;
		} else if (v_type === "Vector2") {
			const value = v as Vector2;
			return `new Vector2(${Codify(value.X)}, ${Codify(value.Y)})`;
		} else if (v_type === "CFrame") {
			const value = v as CFrame;
			if (value === CFrame.identity) return "CFrame.identity";
			const values = value.GetComponents();
			return `new CFrame(${values.map((v) => Codify(v)).join(", ")})`;
		} else if (v_type === "UDim") {
			const value = v as UDim;
			return `new UDim(${Codify(value.Scale)}, ${Codify(value.Offset)})`;
		} else if (v_type === "UDim2") {
			const value = v as UDim2;
			const is_empty =
				value.X.Scale === 0 && value.X.Offset === 0 && value.Y.Scale === 0 && value.Y.Offset === 0;
			const only_scale =
				value.X.Scale !== 0 && value.X.Offset === 0 && value.Y.Scale !== 0 && value.Y.Offset === 0;
			const only_offset =
				value.X.Scale === 0 && value.X.Offset !== 0 && value.Y.Scale === 0 && value.Y.Offset !== 0;
			if (is_empty) return "new UDim2()";
			if (only_scale) return `UDim2.fromScale(${Codify(value.X.Scale)}, ${Codify(value.Y.Scale)})`;
			if (only_offset)
				return `UDim2.fromOffset(${Codify(value.X.Offset)}, ${Codify(value.Y.Offset)})`;
			return `new UDim2(${Codify(value.X.Scale)}, ${Codify(value.X.Offset)}, ${Codify(value.Y.Scale)}, ${Codify(value.Y.Offset)})`;
		} else if (v_type === "Color3") {
			const value = v as Color3;
			const [r, g, b] = [value.R, value.G, value.B].map((v) => math.floor(v * 255));
			return `Color3.fromRGB(${r}, ${g}, ${b})`;
		} else if (v_type === "ColorSequenceKeypoint") {
			const value = v as ColorSequenceKeypoint;
			return `new ColorSequenceKeypoint(${Codify(value.Time)}, ${Codify(value.Value)})`;
		} else if (v_type === "ColorSequence") {
			const value = v as ColorSequence;
			const keypoints = value.Keypoints.map((kp) => Codify(kp));
			return `new ColorSequence([${keypoints.join(", ")}])`;
		} else if (v_type === "NumberRange") {
			const value = v as NumberRange;
			return `new NumberRange(${Codify(value.Min)}, ${Codify(value.Max)})`;
		} else if (v_type === "NumberSequenceKeypoint") {
			const value = v as NumberSequenceKeypoint;
			return `new NumberSequenceKeypoint(${Codify(value.Time)}, ${Codify(value.Value)}, ${Codify(
				value.Envelope,
			)})`;
		} else if (v_type === "NumberSequence") {
			const value = v as NumberSequence;
			const keypoints = value.Keypoints.map((kp) => Codify(kp));
			return `new NumberSequence([${keypoints.join(", ")}])`;
		} else if (v_type === "Ray") {
			const value = v as Ray;
			return `new Ray(${Codify(value.Origin)}, ${Codify(value.Direction)})`;
		} else if (v_type === "Region3") {
			const value = v as Region3;
			const min = value.CFrame.Position.sub(value.Size.div(2));
			const max = value.CFrame.Position.add(value.Size.div(2));
			return `new Region3(${Codify(min)}, ${Codify(max)})`;
		} else if (v_type === "Region3int16") {
			const value = v as Region3int16;
			return `new Region3int16(${Codify(value.Min)}, ${Codify(value.Max)})`;
		} else if (v_type === "BrickColor") {
			const value = v as BrickColor;
			return `new BrickColor(${value.Number})`;
		} else if (v_type === "PhysicalProperties") {
			const value = v as PhysicalProperties;
			return `new PhysicalProperties(${Codify(value.Density)}, ${Codify(value.Friction)}, ${Codify(
				value.Elasticity,
			)}, ${Codify(value.FrictionWeight)}, ${Codify(value.ElasticityWeight)})`;
		} else if (v_type === "Faces") {
			const value = v as Faces;
			const faces: Enum.NormalId[] = [];
			if (value.Top) {
				faces.push(Enum.NormalId.Top);
			}
			if (value.Bottom) {
				faces.push(Enum.NormalId.Bottom);
			}
			if (value.Left) {
				faces.push(Enum.NormalId.Left);
			}
			if (value.Right) {
				faces.push(Enum.NormalId.Right);
			}
			if (value.Back) {
				faces.push(Enum.NormalId.Back);
			}
			if (value.Front) {
				faces.push(Enum.NormalId.Front);
			}
			return `new Faces(${faces.map((face) => `Enum.NormalId.${face.Name}`).join(", ")})`;
		} else if (v_type === "Instance") {
			const value = v as Instance;
			const full_name = value.GetFullName().split(".");
			full_name.shift();
			const path = [game, ...full_name.map((v) => `.WaitForChild("v")`)];
			return path.join("");
		} else if (v_type === "EnumItem") {
			const value = v as EnumItem;
			return tostring(value);
		} else if (v_type === "TweenInfo") {
			const value = v as TweenInfo;
			return `new TweenInfo(${Codify(value.Time)}, ${Codify(value.EasingStyle)}, ${Codify(
				value.EasingDirection,
			)}, ${Codify(value.RepeatCount)}, ${Codify(value.Reverses)}, ${Codify(value.DelayTime)})`;
		} else if (v_type === "DateTime") {
			const value = v as DateTime;
			return `DateTime.fromIsoDate(${value.ToIsoDate()})`;
		} else if (v_type === "Rect") {
			const value = v as Rect;
			return `new Rect(${Codify(value.Min.X)}, ${Codify(value.Min.Y)}, ${Codify(value.Max.X)}, ${Codify(value.Max.Y)})`;
		} else if (v_type === "Vector2int16") {
			const value = v as Vector2int16;
			return `new Vector2int16(${Codify(value.X)}, ${Codify(value.Y)})`;
		} else if (v_type === "Vector3int16") {
			const value = v as Vector3int16;
			return `new Vector3int16(${Codify(value.X)}, ${Codify(value.Y)}, ${Codify(value.Z)})`;
		} else if (v_type === "Font") {
			const value = v as Font;
			return `new Font("${value.Family}", ${value.Weight}, ${value.Style})`;
		} else if (v_type === "FloatCurveKey") {
			const value = v as FloatCurveKey;
			return `new FloatCurveKey(${Codify(value.Time)}, ${Codify(value.Value)})`;
		} else if (v_type === ("Content" as never)) {
			const value = v as Content;
			if (value.SourceType === Enum.ContentSourceType.None) return `Content.none`;
			if (value.SourceType === Enum.ContentSourceType.Uri) return `Content.fromUri("${value.Uri}")`;
		}

		return "undefined";
	}
}
