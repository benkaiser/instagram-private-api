import { BaseModel } from './base-model';

export class Location  extends BaseModel{
  pk: string | number;
  name: string;
  address: string;
  city: string;
  short_name: string;
  lng: number;
  lat: number;
  external_source: string;
  facebook_places_id: string | number;
}
