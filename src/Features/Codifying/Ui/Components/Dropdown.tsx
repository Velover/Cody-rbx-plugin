import React, { useState } from "@rbxts/react";
import { CodifyingResources } from "../../Resources/CodifyingResources";

interface DropdownProps {
	options: string[];
	selected: string;
	onSelect: (value: string) => void;
}

export function Dropdown({ options, selected, onSelect }: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleOptionClick = (option: string) => {
		onSelect(option);
		setIsOpen(false);
	};

	return (
		<frame
			Size={
				new UDim2(
					0,
					CodifyingResources.SIZES.DROPDOWN_WIDTH,
					0,
					CodifyingResources.SIZES.BUTTON_HEIGHT,
				)
			}
			BackgroundTransparency={1}
			ZIndex={isOpen ? 100 : 1}
		>
			{/* Trigger button */}
			<textbutton
				Text={`  ${selected}  ▾`}
				Size={UDim2.fromScale(1, 1)}
				BackgroundColor3={
					isOpen
						? CodifyingResources.COLORS.BUTTON_BACKGROUND_HOVER
						: CodifyingResources.COLORS.BUTTON_BACKGROUND
				}
				TextColor3={CodifyingResources.COLORS.BUTTON_TEXT}
				FontFace={CodifyingResources.FONTS.REGULAR}
				TextSize={14}
				TextXAlignment={Enum.TextXAlignment.Center}
				ZIndex={isOpen ? 101 : 2}
				Event={{
					MouseButton1Click: () => setIsOpen(!isOpen),
				}}
			>
				<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />
			</textbutton>

			{/* Overlay to detect outside clicks (only when open) */}
			{isOpen && (
				<textbutton
					Text={""}
					Size={new UDim2(100, 0, 100, 0)}
					Position={new UDim2(0, -2000, 0, -2000)}
					BackgroundTransparency={1}
					ZIndex={99}
					Event={{
						MouseButton1Click: () => setIsOpen(false),
					}}
				/>
			)}

			{/* Options list */}
			{isOpen && (
				<frame
					Size={
						new UDim2(1, 0, 0, options.size() * CodifyingResources.SIZES.DROPDOWN_OPTION_HEIGHT)
					}
					Position={new UDim2(0, 0, 1, 2)}
					BackgroundColor3={CodifyingResources.COLORS.BUTTON_BACKGROUND}
					BorderColor3={CodifyingResources.COLORS.BORDER}
					BorderSizePixel={CodifyingResources.SIZES.BORDER_SIZE}
					ZIndex={102}
				>
					<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />
					<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />

					{options.map((option, index) => (
						<DropdownOption
							key={`option_${index}`}
							option={option}
							isSelected={option === selected}
							onClick={() => handleOptionClick(option)}
							layoutOrder={index}
						/>
					))}
				</frame>
			)}
		</frame>
	);
}

interface DropdownOptionProps {
	option: string;
	isSelected: boolean;
	onClick: () => void;
	layoutOrder: number;
}

function DropdownOption({ option, isSelected, onClick, layoutOrder }: DropdownOptionProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<textbutton
			Text={`  ${option}`}
			Size={new UDim2(1, 0, 0, CodifyingResources.SIZES.DROPDOWN_OPTION_HEIGHT)}
			BackgroundTransparency={0}
			BackgroundColor3={
				isSelected
					? CodifyingResources.COLORS.CHECKBOX_FILL
					: isHovered
						? CodifyingResources.COLORS.BUTTON_BACKGROUND_HOVER
						: CodifyingResources.COLORS.BUTTON_BACKGROUND
			}
			TextColor3={CodifyingResources.COLORS.BUTTON_TEXT}
			FontFace={isSelected ? CodifyingResources.FONTS.BOLD : CodifyingResources.FONTS.REGULAR}
			TextSize={14}
			TextXAlignment={Enum.TextXAlignment.Left}
			LayoutOrder={layoutOrder}
			ZIndex={103}
			Event={{
				MouseButton1Click: onClick,
				MouseEnter: () => setIsHovered(true),
				MouseLeave: () => setIsHovered(false),
			}}
		>
			<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />
		</textbutton>
	);
}
