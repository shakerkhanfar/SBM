import { createParser } from 'nuqs';

export const getSortingStateParser = <_T = unknown>(validFields: string[]) =>
  createParser<{ id: string; desc: boolean }[]>({
    parse: (value: string) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return null;
        // If no valid fields provided, accept all
        if (validFields.length === 0) return parsed;
        return parsed.filter(
          (s: { id: string; desc: boolean }) =>
            validFields.includes(s.id) && typeof s.desc === 'boolean',
        );
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
  });
