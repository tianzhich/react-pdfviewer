/*
 * @Date: 2019-11-04 16:02:37
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-04 16:39:44
 */
export const NUMBER_PATTERN = /^[1-9][0-9]*$/;

// 初始PDF页面高度，注意：不能设置为0，为0时无法render page
export const INITIAL_PAGE_HEIGHT = 1;

// page scale
export const INITIAL_PAGE_SCALE = 1.0;
export const SCALE_MAX_VAL = 2;
export const SCALE_MIN_VAL = 0.5;
// pageScale变化范围
export const PAGE_SCALE_INTERVAL = 0.1;

// width & height
export const CONTAINER_HEIGHT = 720;
export const CONTAINER_HEIGHT_HEADER_HEIGHT = 50;
export const THUMBNAIL_ITEM_HEIGHT = 128;
export const THUMBNAIL_HEIGHT = CONTAINER_HEIGHT - CONTAINER_HEIGHT_HEADER_HEIGHT;
export const THUMBNAIL_WIDTH = 150;

export const PDF_FILE = "https://pdfobject.com/pdf/sample-3pp.pdf";