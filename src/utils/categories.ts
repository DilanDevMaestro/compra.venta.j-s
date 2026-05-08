export const normalizeCategoryKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const categoryAliases: Record<string, string> = {
  [normalizeCategoryKey('automotores')]: 'Autos, Motos y Otros',
  [normalizeCategoryKey('animales y mascotas')]: 'Mascotas',
  [normalizeCategoryKey('librería y artículos escolares')]: 'Arte, Librería y Mercería',
  [normalizeCategoryKey('ferretería y construcción')]: 'Construcción',
  [normalizeCategoryKey('indumentaria y accesorios')]: 'Ropa y Accesorios',
  [normalizeCategoryKey('gimnasios y fitness')]: 'Deportes y Fitness',
  [normalizeCategoryKey('muebles y hogar')]: 'Hogar, Muebles y Jardín',
  [normalizeCategoryKey('servicios')]: 'Servicios'
}

export const resolveCategoryName = (value: string) => {
  const key = normalizeCategoryKey(value)
  return categoryAliases[key] ?? value
}

export const resolveCategoryKey = (value: string) => normalizeCategoryKey(resolveCategoryName(value))

export const categoryToSlug = (value: string) =>
  normalizeCategoryKey(value).replace(/\s+/g, '-')

export const slugToCategoryKey = (value: string) =>
  value.toLowerCase().replace(/-/g, ' ')
