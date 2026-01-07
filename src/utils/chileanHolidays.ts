// Feriados chilenos
export interface ChileanHoliday {
  date: Date;
  name: string;
}

// Calcula la fecha de Pascua usando el algoritmo de Butcher
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
};

// Calcula Viernes Santo (2 días antes de Pascua)
const calculateGoodFriday = (year: number): Date => {
  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  return goodFriday;
};

// Calcula Sábado Santo (1 día antes de Pascua)
const calculateHolySaturday = (year: number): Date => {
  const easter = calculateEaster(year);
  const holySaturday = new Date(easter);
  holySaturday.setDate(easter.getDate() - 1);
  return holySaturday;
};

export const getChileanHolidays = (year: number): ChileanHoliday[] => {
  const holidays: ChileanHoliday[] = [
    // Feriados fijos
    { date: new Date(year, 0, 1), name: "Año Nuevo" },
    { date: new Date(year, 4, 1), name: "Día del Trabajo" },
    { date: new Date(year, 4, 21), name: "Día de las Glorias Navales" },
    { date: new Date(year, 5, 20), name: "Día Nacional de los Pueblos Indígenas" },
    { date: new Date(year, 5, 29), name: "San Pedro y San Pablo" },
    { date: new Date(year, 6, 16), name: "Día de la Virgen del Carmen" },
    { date: new Date(year, 7, 15), name: "Asunción de la Virgen" },
    { date: new Date(year, 8, 18), name: "Fiestas Patrias" },
    { date: new Date(year, 8, 19), name: "Día de las Glorias del Ejército" },
    { date: new Date(year, 8, 20), name: "Feriado Fiestas Patrias" }, // 2026 específico
    { date: new Date(year, 9, 12), name: "Encuentro de Dos Mundos" },
    { date: new Date(year, 9, 31), name: "Día de las Iglesias Evangélicas" },
    { date: new Date(year, 10, 1), name: "Día de Todos los Santos" },
    { date: new Date(year, 11, 8), name: "Inmaculada Concepción" },
    { date: new Date(year, 11, 25), name: "Navidad" },
    
    // Feriados móviles
    { date: calculateGoodFriday(year), name: "Viernes Santo" },
    { date: calculateHolySaturday(year), name: "Sábado Santo" },
  ];

  return holidays;
};

export const isChileanHoliday = (date: Date, holidays: ChileanHoliday[]): ChileanHoliday | undefined => {
  return holidays.find(
    (h) =>
      h.date.getDate() === date.getDate() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getFullYear() === date.getFullYear()
  );
};
