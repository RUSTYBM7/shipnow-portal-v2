/**
 * Wales HQ Global Logistics - Regions Configuration
 * Grouped by continent for sidebar filters and UI
 */

import { Country } from './countries';

export interface Region {
  id: string;
  name: string;
  icon: string;
  countries: string[]; // ISO codes
  center: [number, number];
  zoom: number;
}

export const regions: Region[] = [
  {
    id: 'wales-hq',
    name: 'Wales HQ',
    icon: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    countries: ['GB', 'GB-WLS', 'IE'],
    center: [-3.7833, 51.4816],
    zoom: 6
  },
  {
    id: 'europe',
    name: 'Europe',
    icon: '🌍',
    countries: ['GB', 'GB-WLS', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'PT', 'PL', 'SE', 'NO', 'DK', 'FI', 'GR', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'UA', 'RU', 'TR'],
    center: [10, 52],
    zoom: 4
  },
  {
    id: 'north-america',
    name: 'North America',
    icon: '🌎',
    countries: ['US', 'CA', 'MX'],
    center: [-100, 40],
    zoom: 3
  },
  {
    id: 'south-america',
    name: 'South America',
    icon: '🌎',
    countries: ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'],
    center: [-60, -15],
    zoom: 3
  },
  {
    id: 'asia',
    name: 'Asia',
    icon: '🌏',
    countries: ['JP', 'CN', 'KR', 'IN', 'SG', 'HK', 'TW', 'TH', 'MY', 'ID', 'PH', 'VN', 'AE', 'SA', 'IL', 'PK', 'BD', 'LK', 'NP', 'MM', 'KH', 'LA', 'MN', 'TW'],
    center: [100, 30],
    zoom: 3
  },
  {
    id: 'oceania',
    name: 'Oceania',
    icon: '🌏',
    countries: ['AU', 'NZ', 'PG', 'FJ', 'SB', 'VU', 'NC', 'PF', 'WS', 'TO', 'KI', 'FM', 'MH', 'NR', 'PW'],
    center: [140, -25],
    zoom: 4
  },
  {
    id: 'africa',
    name: 'Africa',
    icon: '🌍',
    countries: ['ZA', 'EG', 'NG', 'KE', 'MA', 'DZ', 'TN', 'LY', 'GH', 'TZ', 'UG', 'ET', 'SN', 'CI', 'CM', 'GA', 'CG', 'CD', 'AO', 'MZ', 'ZW', 'ZM', 'BW', 'NA', 'RW', 'BI', 'DJ', 'SO', 'ER', 'SD'],
    center: [20, 0],
    zoom: 3
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    icon: '🏜️',
    countries: ['AE', 'SA', 'IL', 'TR', 'IR', 'IQ', 'JO', 'LB', 'SY', 'KW', 'QA', 'BH', 'OM', 'YE', 'AF'],
    center: [45, 28],
    zoom: 4
  }
];

export const getRegionByCountry = (countryIso: string): Region | undefined => {
  return regions.find(r => r.countries.includes(countryIso));
};

export const getRegionById = (regionId: string): Region | undefined => {
  return regions.find(r => r.id === regionId);
};

export default regions;
