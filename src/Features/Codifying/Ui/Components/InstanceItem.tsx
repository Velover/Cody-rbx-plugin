import React from "@rbxts/react";
import { CodifyingController } from "../../Controllers/CodifyingController";
import { CodifyingResources } from "../../Resources/CodifyingResources";

interface InstanceItemProps {
	instanceData: CodifyingController.IInstanceData;
	isExcluded: boolean;
	onToggle: () => void;
	layoutOrder: number;
}

export function InstanceItem({
	instanceData,
	isExcluded,
	onToggle,
	layoutOrder,
}: InstanceItemProps) {
	const { Name, Icon, NestLevel } = instanceData;
	const indentSize = NestLevel * 16;

	return (
		<frame
			Size={new UDim2(1, 0, 0, CodifyingResources.SIZES.INSTANCE_ITEM_HEIGHT)}
			BackgroundColor3={
				layoutOrder % 2 === 0
					? CodifyingResources.COLORS.INSTANCE_ITEM_BACKGROUND
					: CodifyingResources.COLORS.INSTANCE_ITEM_BACKGROUND_ALT
			}
			BorderSizePixel={0}
			LayoutOrder={layoutOrder}
		>
			<uipadding
				PaddingLeft={new UDim(0, indentSize + CodifyingResources.SIZES.PADDING)}
				PaddingRight={new UDim(0, CodifyingResources.SIZES.PADDING)}
			/>

			<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, 8)}
				/>

				{/* Instance Icon */}
				<imagelabel
					Size={UDim2.fromOffset(
						CodifyingResources.SIZES.ICON_SIZE,
						CodifyingResources.SIZES.ICON_SIZE,
					)}
					BackgroundTransparency={1}
					Image={Icon.Image}
					ImageRectOffset={Icon.ImageRectOffset}
					ImageRectSize={Icon.ImageRectSize}
				/>

				{/* Instance Name */}
				<textlabel
					Size={
						new UDim2(
							1,
							-CodifyingResources.SIZES.ICON_SIZE - CodifyingResources.SIZES.CHECKBOX_SIZE - 16,
							1,
							0,
						)
					}
					BackgroundTransparency={1}
					FontFace={CodifyingResources.FONTS.REGULAR}
					TextColor3={CodifyingResources.COLORS.TEXT_PRIMARY}
					TextSize={14}
					Text={Name}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextTruncate={Enum.TextTruncate.AtEnd}
				/>

				{/* Checkbox for inclusion/exclusion */}
				<textbutton
					Text={""}
					Size={UDim2.fromOffset(
						CodifyingResources.SIZES.CHECKBOX_SIZE,
						CodifyingResources.SIZES.CHECKBOX_SIZE,
					)}
					BackgroundColor3={
						!isExcluded
							? CodifyingResources.COLORS.CHECKBOX_FILL
							: CodifyingResources.COLORS.CHECKBOX_BACKGROUND
					}
					BorderColor3={CodifyingResources.COLORS.CHECKBOX_BORDER}
					BorderSizePixel={1}
					Event={{
						MouseButton1Click: onToggle,
					}}
				>
					<uicorner CornerRadius={new UDim(0, 2)} />

					{!isExcluded && (
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
			</frame>
		</frame>
	);
}
