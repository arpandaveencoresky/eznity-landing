import React from 'react';
import TemplatePreview from "./TemplatePreview";

interface DemoVideoLayoutProps {
  aspectRatio: string;
  headlineText?: string;
  subtitleText?: string;
  headlinePosition: { x: number; y: number };
  subtitlePosition: { x: number; y: number };
  headlineSize: { width: number; height: number };
  subtitleSize: { width: number; height: number };
  headlineStyles: any;
  subtitleStyles: any;
  selectedTextBlock: 'headline' | 'subtitle' | null;
  onHeadlineDrag: (position: { x: number; y: number }) => void;
  onSubtitleDrag: (position: { x: number; y: number }) => void;
  onHeadlineResize: (size: { width: number; height: number }) => void;
  onSubtitleResize: (size: { width: number; height: number }) => void;
  onHeadlineClick: () => void;
  onSubtitleClick: () => void;
}

const DemoVideoLayout: React.FC<DemoVideoLayoutProps> = ({
  aspectRatio,
  headlineText = "HERE IS A LINE OF HEADLINE",
  subtitleText = "wizards jump",
  headlinePosition,
  subtitlePosition,
  headlineSize,
  subtitleSize,
  headlineStyles,
  subtitleStyles,
  selectedTextBlock,
  onHeadlineDrag,
  onSubtitleDrag,
  onHeadlineResize,
  onSubtitleResize,
  onHeadlineClick,
  onSubtitleClick,
}) => {
  return (
    <TemplatePreview
      headlineText={headlineText}
      subtitleText={subtitleText}
      headlinePosition={headlinePosition}
      subtitlePosition={subtitlePosition}
      headlineSize={headlineSize}
      subtitleSize={subtitleSize}
      headlineStyles={headlineStyles}
      subtitleStyles={subtitleStyles}
      aspectRatio={aspectRatio}
      size="large"
      selectedTextBlock={selectedTextBlock}
      onHeadlineDrag={onHeadlineDrag}
      onSubtitleDrag={onSubtitleDrag}
      onHeadlineResize={onHeadlineResize}
      onSubtitleResize={onSubtitleResize}
      onHeadlineClick={onHeadlineClick}
      onSubtitleClick={onSubtitleClick}
      showBackground={true}
    />
  );
};

export default DemoVideoLayout;