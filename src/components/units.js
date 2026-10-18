import { useSyncExternalStore } from "react";
import { m } from "../paraglide/messages.js";
import { getLocale } from "../paraglide/runtime.js";

const STORAGE_KEY = "amtrakerUnits";
const KM_PER_MILE = 1.609344;
const listeners = new Set();

const getSavedUnits = () => {
  try {
    const units = localStorage.getItem(STORAGE_KEY);
    return units === "imperial" || units === "metric" ? units : null;
  } catch (e) {
    return null;
  }
};

// without a saved choice, english defaults to imperial and french/spanish to metric (canada and mexico use metric)
export const getUnits = () => getSavedUnits() ?? (getLocale() === "en" ? "imperial" : "metric");

export const setUnits = (units) => {
  try {
    localStorage.setItem(STORAGE_KEY, units);
  } catch (e) {
    // no localstorage, cool
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// re-renders the component when the units change
export const useUnits = () => useSyncExternalStore(subscribe, getUnits);

export const toDisplayDistance = (miles, units = getUnits()) => (units === "metric" ? miles * KM_PER_MILE : miles);
export const fromDisplayDistance = (value, units = getUnits()) => (units === "metric" ? value / KM_PER_MILE : value);

export const formatSpeed = (mph, decimals = 1, units = getUnits()) => {
  const speed = toDisplayDistance(mph, units).toFixed(decimals);
  return units === "metric" ? m["common_strings.speed_kmh"]({ speed }) : m["common_strings.speed_mph"]({ speed });
};
