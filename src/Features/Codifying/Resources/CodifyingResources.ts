import { GuiResources } from "../../PluginUI/Resources/GuiResources";

export namespace CodifyingResources {
	export const MAX_DISPLAYED_INSTANCES = 1000; // Maximum number of instances to display in the UI
	// Fonts reference from GuiResources
	export namespace FONTS {
		export const REGULAR = GuiResources.FONT_REGULAR;
		export const BOLD = GuiResources.FONT_BOLD;
	}

	// Dark theme colors
	export namespace COLORS {
		// Main UI colors
		export const BACKGROUND = new Color3(0.1, 0.1, 0.12); // Dark background
		export const BORDER = new Color3(0.2, 0.2, 0.25); // Slightly lighter border
		export const TEXT_PRIMARY = new Color3(0.9, 0.9, 0.95); // Light text

		// Instance list colors
		export const INSTANCE_ITEM_BACKGROUND = new Color3(0.12, 0.12, 0.15); // Dark item background
		export const INSTANCE_ITEM_BACKGROUND_ALT = new Color3(0.14, 0.14, 0.17); // Slightly different for alternating rows

		// Button colors
		export const BUTTON_BACKGROUND = new Color3(0.2, 0.2, 0.25); // Dark button
		export const BUTTON_BACKGROUND_HOVER = new Color3(0.25, 0.25, 0.3); // Slightly lighter on hover
		export const BUTTON_TEXT = new Color3(0.9, 0.9, 0.95); // Light button text

		// Checkbox colors
		export const CHECKBOX_BACKGROUND = new Color3(0.15, 0.15, 0.18); // Dark checkbox background
		export const CHECKBOX_FILL = new Color3(0.3, 0.4, 0.9); // Blue-ish fill when checked
		export const CHECKBOX_BORDER = new Color3(0.3, 0.3, 0.35); // Light border
		export const CHECKBOX_CHECK = new Color3(1, 1, 1); // White check mark

		// Output colors
		export const OUTPUT_BACKGROUND = new Color3(0.12, 0.12, 0.15); // Dark output background
	}

	// UI Element Sizes
	export namespace SIZES {
		export const PADDING = 8;
		export const BORDER_SIZE = 1;
		export const CORNER_RADIUS = 4;
		export const BUTTON_HEIGHT = 30;
		export const CHECKBOX_SIZE = 20;
		export const INSTANCE_ITEM_HEIGHT = 24;
		export const ICON_SIZE = 16;
	}
}
