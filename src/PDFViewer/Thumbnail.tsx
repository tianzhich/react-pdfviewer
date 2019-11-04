/**
 * @Date: 2019-11-04 15:59:15
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-04 16:36:57
 */
import React, { SFC } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_ITEM_HEIGHT,
  THUMBNAIL_WIDTH
} from "./const";
import { PDFThumbnailItemData } from "./type";
import { Page } from "react-pdf";

type Prop = {
  numPages: number;
  onClickThumbnail: (index: number) => void;
  show?: boolean;
};

export interface PDFThumbnailProps extends ListChildComponentProps {
  data: PDFThumbnailItemData;
}

const PDFThumbnail = ({ index, style, data }: PDFThumbnailProps) => {
  const { onClickThumbnail } = data;
  return (
    <div style={style}>
      <div className="thumbnail-item" onClick={() => onClickThumbnail(index)}>
        <Page
          pageNumber={index + 1}
          height={THUMBNAIL_ITEM_HEIGHT}
          renderTextLayer={false}
        />
      </div>
      <div className="thumbnail-page-num">{index + 1}</div>
    </div>
  );
};

const Thumbnail: SFC<Prop> = props => {
  const { numPages, onClickThumbnail, show } = props;
  const itemData: PDFThumbnailItemData = {
    onClickThumbnail
  };
  return (
    <List
      height={THUMBNAIL_HEIGHT}
      itemCount={numPages}
      itemSize={THUMBNAIL_ITEM_HEIGHT + 20}
      itemData={itemData}
      width={THUMBNAIL_WIDTH}
      className={`pdf-viewer-thumbnail ${!show ? "hidden" : ""}`}
    >
      {PDFThumbnail}
    </List>
  );
};

export default Thumbnail;
