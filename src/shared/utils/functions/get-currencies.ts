import { countries } from 'country-data';
import { countriesEsEn } from '../translate';

export function getCurrency(countryName: string): string {
  const englishCountryName = countriesEsEn[countryName];
  if (!englishCountryName) {
    return 'País no encontrado';
  }

  const country = countries.all.find(
    (country) =>
      country.name.toLowerCase() === englishCountryName.toLowerCase(),
  );

  return country ? country.currencies[0] : 'País no encontrado';
}
