import type { Locale } from '../i18n';
import meteoContent from '../data/meteo-content.json';

export const CALDE_LAT = 45.9448;
export const CALDE_LON = 8.6612;

export const WIND_DIR_DEGREES: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

const CACHE_TTL_MS = 5 * 60 * 1000;

declare global {
  var weatherCache: Record<string, { data: ForecastData; timestamp: number }> | undefined;
}

export interface HourlyData {
  time: string;
  hour: number;
  windSpeed: number;
  windDirection: number;
  isPast: boolean;
  isNow: boolean;
}

export interface DailyData {
  date: string;
  dayName: string;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  tempMax: number;
  tempMin: number;
  windMax: number;
  windDirection: string;
}

export interface CurrentData {
  windSpeed: number;
  windDirection: string;
  windDirectionDeg: number;
  temperature: number;
  humidity: number;
}

export interface ForecastData {
  current: CurrentData;
  hourly: HourlyData[];
  daily: DailyData[];
  fetchTime: string;
}

export interface WindColorClasses {
  bg: string;
  text: string;
  bar: string;
  border: string;
  glow: string;
}

type LocalizedText = { it: string; en?: string; de?: string };

function localize(obj: LocalizedText | undefined, locale: Locale, fallback = ''): string {
  if (!obj) return fallback;
  return obj[locale] || obj.it || fallback;
}

export function degToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

export function getWindArrowRotation(direction: string): number {
  return (WIND_DIR_DEGREES[direction] || 0) + 180;
}

export function formatForecastDate(dateStr: string, locale: Locale): string {
  const parts = dateStr.split('-');
  const day = parts[2];
  const month = parts[1];

  if (locale === 'en') return `${month}/${day}`;
  if (locale === 'de') return `${day}.${month}`;
  return `${day}/${month}`;
}

export function getWindColorClass(speed: number): WindColorClasses {
  if (speed < 3) {
    return {
      bg: 'bg-sky-400/10',
      text: 'text-sky-400',
      bar: 'bg-sky-400',
      border: 'border-sky-400/40',
      glow: 'rgba(56, 189, 248, 0.3)',
    };
  }
  if (speed < 7) {
    return {
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-400',
      bar: 'bg-emerald-400',
      border: 'border-emerald-400/40',
      glow: 'rgba(52, 211, 153, 0.3)',
    };
  }
  if (speed < 11) {
    return {
      // Yellow, not amber: amber (#fbbf24) and the orange tier below it
      // (#fb923c) read as basically the same color — yellow gives real
      // hue separation between "esperti" and "attenzione".
      bg: 'bg-yellow-400/10',
      text: 'text-yellow-400',
      bar: 'bg-yellow-400',
      border: 'border-yellow-400/40',
      glow: 'rgba(250, 204, 21, 0.3)',
    };
  }
  if (speed < 16) {
    return {
      bg: 'bg-orange-400/10',
      text: 'text-orange-400',
      bar: 'bg-orange-400',
      border: 'border-orange-400/40',
      glow: 'rgba(251, 146, 60, 0.3)',
    };
  }
  return {
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    bar: 'bg-red-400',
    border: 'border-red-400/40',
    glow: 'rgba(248, 113, 113, 0.3)',
  };
}

function getWeatherInfo(code: number, locale: Locale) {
  const weatherMap: Record<number, { key: string; icon: string }> = {
    0: { key: 'clear', icon: '☀️' },
    1: { key: 'partlyCloudy', icon: '🌤️' },
    2: { key: 'partlyCloudy', icon: '⛅' },
    3: { key: 'cloudy', icon: '☁️' },
    45: { key: 'fog', icon: '🌫️' },
    48: { key: 'fog', icon: '🌫️' },
    51: { key: 'drizzle', icon: '🌧️' },
    53: { key: 'drizzle', icon: '🌧️' },
    55: { key: 'drizzle', icon: '🌧️' },
    61: { key: 'lightRain', icon: '🌧️' },
    63: { key: 'rain', icon: '🌧️' },
    65: { key: 'heavyRain', icon: '🌧️' },
    71: { key: 'snow', icon: '🌨️' },
    73: { key: 'snow', icon: '🌨️' },
    75: { key: 'snow', icon: '🌨️' },
    80: { key: 'showers', icon: '🌦️' },
    81: { key: 'showers', icon: '🌦️' },
    82: { key: 'showers', icon: '🌦️' },
    95: { key: 'thunderstorm', icon: '⛈️' },
    96: { key: 'thunderstorm', icon: '⛈️' },
    99: { key: 'thunderstorm', icon: '⛈️' },
  };

  const info = weatherMap[code] || { key: 'clear', icon: '❓' };
  const weatherContent = meteoContent.weather as Record<string, LocalizedText>;
  const desc = weatherContent[info.key]
    ? localize(weatherContent[info.key], locale)
    : 'N/A';

  return { desc, icon: info.icon };
}

function getDayName(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return localize(meteoContent.days.today, locale);
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return localize(meteoContent.days.tomorrow, locale);
  }

  return date.toLocaleDateString(
    locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-US' : 'it-IT',
    { weekday: 'short', day: 'numeric' }
  );
}

function mapDailyData(data: any, locale: Locale, forecastDays: number): DailyData[] {
  return data.daily.time.slice(0, forecastDays).map((dateStr: string, i: number) => {
    const weatherInfo = getWeatherInfo(data.daily.weather_code[i], locale);
    return {
      date: dateStr,
      dayName: getDayName(dateStr, locale),
      weatherCode: data.daily.weather_code[i],
      weatherDesc: weatherInfo.desc,
      weatherIcon: weatherInfo.icon,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      windMax: Math.round(data.daily.wind_speed_10m_max[i]),
      windDirection: degToCompass(data.daily.wind_direction_10m_dominant[i]),
    };
  });
}

export function buildForecastMap(daily: DailyData[]): Map<string, DailyData> {
  return new Map(daily.map((day) => [day.date, day]));
}

export function getForecastForDate(
  daily: DailyData[],
  date: string
): DailyData | undefined {
  return daily.find((day) => day.date === date);
}

export async function fetchForecast(
  locale: Locale,
  forecastDays = 7
): Promise<ForecastData | null> {
  const cacheKey = `${locale}-${forecastDays}`;
  const now = Date.now();
  const cached = globalThis.weatherCache?.[cacheKey];
  const isCacheValid =
    cached &&
    now - cached.timestamp < CACHE_TTL_MS &&
    cached.data.hourly[0]?.hasOwnProperty('isPast');

  if (isCacheValid) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${CALDE_LAT}&longitude=${CALDE_LON}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m` +
        `&hourly=wind_speed_10m,wind_direction_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant` +
        `&wind_speed_unit=kn` +
        `&timezone=Europe/Rome` +
        `&forecast_days=${forecastDays}`
    );

    if (!response.ok) throw new Error('Weather API fetch failed');

    const data = await response.json();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const todayStr = currentTime.toISOString().split('T')[0];

    const currentData: CurrentData = {
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: degToCompass(data.current.wind_direction_10m),
      windDirectionDeg: data.current.wind_direction_10m,
      temperature: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relative_humidity_2m),
    };

    const hourlyData: HourlyData[] = [];
    for (let targetHour = 0; targetHour < 24; targetHour++) {
      const targetTimeStr = `${todayStr}T${String(targetHour).padStart(2, '0')}`;
      const idx = data.hourly.time.findIndex((t: string) => t.startsWith(targetTimeStr));

      if (idx !== -1) {
        hourlyData.push({
          time: String(targetHour).padStart(2, '0') + ':00',
          hour: targetHour,
          windSpeed: Math.round(data.hourly.wind_speed_10m[idx]),
          windDirection: data.hourly.wind_direction_10m[idx],
          isPast: targetHour < currentHour,
          isNow: targetHour === currentHour,
        });
      } else {
        hourlyData.push({
          time: String(targetHour).padStart(2, '0') + ':00',
          hour: targetHour,
          windSpeed: 0,
          windDirection: 0,
          isPast: targetHour < currentHour,
          isNow: targetHour === currentHour,
        });
      }
    }

    const forecastData: ForecastData = {
      current: currentData,
      hourly: hourlyData,
      daily: mapDailyData(data, locale, forecastDays),
      fetchTime: new Date().toLocaleTimeString(
        locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-US' : 'it-IT',
        { hour: '2-digit', minute: '2-digit' }
      ),
    };

    globalThis.weatherCache = {
      ...globalThis.weatherCache,
      [cacheKey]: {
        data: forecastData,
        timestamp: Date.now(),
      },
    };

    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
}

export async function fetchDailyForecast(
  locale: Locale,
  forecastDays = 7
): Promise<DailyData[] | null> {
  const forecast = await fetchForecast(locale, forecastDays);
  return forecast?.daily ?? null;
}

export function getDailyForecastAriaLabel(day: DailyData, locale: Locale): string {
  const labels: Record<Locale, string> = {
    it: `${day.weatherDesc}, vento ${day.windMax} nodi da ${day.windDirection}, massima ${day.tempMax} gradi, minima ${day.tempMin} gradi`,
    en: `${day.weatherDesc}, wind ${day.windMax} knots from ${day.windDirection}, high ${day.tempMax} degrees, low ${day.tempMin} degrees`,
    de: `${day.weatherDesc}, Wind ${day.windMax} Knoten aus ${day.windDirection}, Höchsttemperatur ${day.tempMax} Grad, Tiefsttemperatur ${day.tempMin} Grad`,
  };
  return labels[locale];
}
