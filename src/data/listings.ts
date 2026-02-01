export type Listing = {
  id: string
  title: string
  price: number
  location: string
  imageUrl: string
  featured?: boolean
  isOffer?: boolean
  subcategory?: string
}

export const listings: Listing[] = [
  {
    id: '1',
    title: 'Toyota Corolla 2018',
    price: 8900,
    location: 'CABA',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    featured: true
  },
  {
    id: '2',
    title: 'Departamento 2 ambientes',
    price: 45000,
    location: 'Rosario',
    imageUrl: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=1200&auto=format&fit=crop',
    featured: true
  },
  {
    id: '3',
    title: 'Notebook Gamer RTX',
    price: 1550,
    location: 'Córdoba',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    featured: true
  },
  {
    id: '4',
    title: 'Muebles para living',
    price: 320,
    location: 'Mendoza',
    imageUrl: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop',
    isOffer: true
  },
  {
    id: '5',
    title: 'Celular gama alta',
    price: 799,
    location: 'La Plata',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    isOffer: true
  },
  {
    id: '6',
    title: 'Servicio de mudanzas',
    price: 120,
    location: 'Mar del Plata',
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
    isOffer: true
  }
]
