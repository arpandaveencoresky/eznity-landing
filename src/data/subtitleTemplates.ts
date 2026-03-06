import { SubtitleConfig, TitleConfig, DEFAULT_SUBTITLE_CONFIG, DEFAULT_TITLE_CONFIG } from "@/types/subtitle";

export const allSubtitleStyles = [
    { id: "style-1", name: "Default" },
];

export const getSubtitleStyleConfig = (id: string): SubtitleConfig => {
    return DEFAULT_SUBTITLE_CONFIG;
};

export const getTitleStyleConfig = (id: string): TitleConfig => {
    return DEFAULT_TITLE_CONFIG;
};

export const getStyleByStyleId = (id: string) => {
    return {
        id,
        name: "Default",
        config: DEFAULT_SUBTITLE_CONFIG
    }
}

export const mergeSubtitleConfig = (base: SubtitleConfig, override: SubtitleConfig): SubtitleConfig => {
    return { ...base, ...override };
}

export const BLANK_STYLE_CONFIG: SubtitleConfig = { ...DEFAULT_SUBTITLE_CONFIG, "subtitle-container": { ...DEFAULT_SUBTITLE_CONFIG["subtitle-container"], opacity: "0" } };
