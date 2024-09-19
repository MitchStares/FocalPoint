declare module 'exif-js-heic' {
  namespace EXIF {
    function getData(img: string | Blob | File, callback: () => void): void;
    function getTag(img: any, tag: string): any;
  }
  export = EXIF;
}
