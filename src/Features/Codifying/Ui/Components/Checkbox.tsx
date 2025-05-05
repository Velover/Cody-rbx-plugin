import React from "@rbxts/react";
import { CodifyingResources } from "../../Resources/CodifyingResources";

interface CheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
	return (
		<frame
			Size={new UDim2(0, 150, 0, CodifyingResources.SIZES.CHECKBOX_SIZE)}
			BackgroundTransparency={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, 8)}
			/>

			{/* Checkbox */}
			<textbutton
				Text={""}
				Size={UDim2.fromOffset(
					CodifyingResources.SIZES.CHECKBOX_SIZE,
					CodifyingResources.SIZES.CHECKBOX_SIZE,
				)}
				BackgroundColor3={
					checked
						? CodifyingResources.COLORS.CHECKBOX_FILL
						: CodifyingResources.COLORS.CHECKBOX_BACKGROUND
				}
				BorderColor3={CodifyingResources.COLORS.CHECKBOX_BORDER}
				BorderSizePixel={1}
				Event={{
					MouseButton1Click: () => onChange(!checked),
				}}
			>
				<uicorner CornerRadius={new UDim(0, 2)} />

				{checked && (
					<imagelabel
						Size={UDim2.fromScale(0.7, 0.7)}
						Position={UDim2.fromScale(0.5, 0.5)}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image="rbxassetid://6031094667" // Check mark icon
						ImageColor3={CodifyingResources.COLORS.CHECKBOX_CHECK}
					/>
				)}
			</textbutton>

			{/* Label */}
			<textlabel
				Size={new UDim2(1, -CodifyingResources.SIZES.CHECKBOX_SIZE - 8, 1, 0)}
				BackgroundTransparency={1}
				FontFace={CodifyingResources.FONTS.REGULAR}
				TextColor3={CodifyingResources.COLORS.TEXT_PRIMARY}
				TextSize={14}
				Text={label}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</frame>
	);
}
