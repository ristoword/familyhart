/**
 * Dati iniziali luoghi sicuri - associazioni membri
 * Casa: tutti, Scuola: Giulia, Lavoro: Marco, Nonni: Giulia e Luca
 */

import { safePlaces } from './mock/safePlaces';

export function getInitialPlaces() {
  return [
    { ...safePlaces[0], memberIds: ['1', '2', '3', '4'] },
    { ...safePlaces[1], memberIds: ['3'] },
    { ...safePlaces[2], memberIds: ['1'] },
    { ...safePlaces[3], memberIds: ['3', '4'] },
  ];
}
