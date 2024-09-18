export interface Image {
  id: number;
  url: string;
  tags: string[];
  metadata: {
    filename: string;
    date: string;
    time: string;
    location: string;
    camera: string;
    lens: string;
    iso: string;
    aperture: string;
    shutterSpeed: string;
  };
}
