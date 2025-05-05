import { GuiResources } from "../../PluginUI/Resources/GuiResources";

export namespace CodifyingResources {
	// Colors
	export const COLORS = {
		BACKGROUND: Color3.fromRGB(240, 240, 240),
		TEXT_PRIMARY: Color3.fromRGB(30, 30, 30),
		TEXT_SECONDARY: Color3.fromRGB(100, 100, 100),
		BUTTON_BACKGROUND: Color3.fromRGB(0, 122, 204),
		BUTTON_TEXT: Color3.fromRGB(255, 255, 255),
		BUTTON_BACKGROUND_HOVER: Color3.fromRGB(0, 102, 184),
		OUTPUT_BACKGROUND: Color3.fromRGB(245, 245, 245),
		INSTANCE_ITEM_BACKGROUND: Color3.fromRGB(255, 255, 255),
		INSTANCE_ITEM_BACKGROUND_ALT: Color3.fromRGB(248, 248, 248),
		BORDER: Color3.fromRGB(200, 200, 200),
		CHECKBOX_BACKGROUND: Color3.fromRGB(255, 255, 255),
		CHECKBOX_BORDER: Color3.fromRGB(150, 150, 150),
		CHECKBOX_FILL: Color3.fromRGB(0, 122, 204),
		CHECKBOX_CHECK: Color3.fromRGB(255, 255, 255),
	};

	// Sizes
	export const SIZES = {
		PADDING: 8,
		BORDER_SIZE: 1,
		CORNER_RADIUS: 4,
		BUTTON_HEIGHT: 30,
		INSTANCE_ITEM_HEIGHT: 30,
		CHECKBOX_SIZE: 16,
		ICON_SIZE: 16,
	};

	// Fonts
	export const FONTS = {
		REGULAR: GuiResources.FONT_REGULAR,
		BOLD: GuiResources.FONT_BOLD,
	};
}
