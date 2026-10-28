import type { ImageMetadata } from 'astro'

import catalog1 from '@/img/catalog/watch-1.png'
import catalog2 from '@/img/catalog/watch-2.png'
import catalog3 from '@/img/catalog/watch-3.png'
import catalog4 from '@/img/catalog/watch-4.png'
import catalog5 from '@/img/catalog/watch-5.png'
import catalog6 from '@/img/catalog/watch-6.png'
import catalog7 from '@/img/catalog/watch-7.png'
import catalog8 from '@/img/catalog/watch-8.png'
import popular1 from '@/img/popular/watch-1.png'
import popular2 from '@/img/popular/watch-2.png'
import popular3 from '@/img/popular/watch-3.png'
import strap1 from '@/img/straps/strap-1.png'
import strap2 from '@/img/straps/strap-2.png'
import strap3 from '@/img/straps/strap-3.png'
import viewed1 from '@/img/viewed/watch-1.png'
import viewed2 from '@/img/viewed/watch-2.png'
import viewed3 from '@/img/viewed/watch-3.png'

export interface Crop {
  left: string
  top: string
  width: string
  height: string
}

export interface Product {
  id: string
  brand: string
  price: string
  amount: number
  image: ImageMetadata
  alt: string
  crop: Crop
}

const priced = (amount: number): string =>
  String(amount).replace(/\B(?=(?:\d{3})+$)/gu, ' ')

const make = (
  id: string,
  brand: string,
  amount: number,
  image: ImageMetadata,
  alt: string,
  crop: Crop,
): Product => ({ id, brand, price: priced(amount), amount, image, alt, crop })

export const CATALOG: Product[] = [
  make(
    'catalog-1',
    'TECHNE',
    12700,
    catalog1,
    'Наручные часы TECHNE на оливковом ремешке',
    {
      left: '0.88%',
      top: '4%',
      width: '101.8%',
      height: '101%',
    },
  ),
  make(
    'catalog-2',
    'TECHNE',
    12700,
    catalog2,
    'Наручные часы TECHNE на светлом текстильном ремешке',
    {
      left: '1.79%',
      top: '6.67%',
      width: '96.43%',
      height: '95.67%',
    },
  ),
  make(
    'catalog-3',
    'TECHNE',
    15700,
    catalog3,
    'Наручные часы TECHNE на рыжем кожаном ремешке',
    {
      left: '-0.2%',
      top: '4.33%',
      width: '100.79%',
      height: '100%',
    },
  ),
  make(
    'catalog-4',
    'TECHNE',
    15700,
    catalog4,
    'Наручные часы TECHNE на чёрном ремешке',
    {
      left: '8.44%',
      top: '10.33%',
      width: '86.68%',
      height: '86%',
    },
  ),
  make(
    'catalog-5',
    'TECHNE',
    12700,
    catalog5,
    'Наручные часы TECHNE на песочном ремешке',
    {
      left: '9.96%',
      top: '14.67%',
      width: '79.29%',
      height: '78.67%',
    },
  ),
  make(
    'catalog-6',
    'BVLGARI',
    72700,
    catalog6,
    'Наручные часы BVLGARI на стальном браслете',
    {
      left: '-2.63%',
      top: '0%',
      width: '106.84%',
      height: '106%',
    },
  ),
  make(
    'catalog-7',
    'TECHNE',
    22700,
    catalog7,
    'Наручные часы TECHNE на коричневом ремешке',
    {
      left: '-8.92%',
      top: '-3%',
      width: '116.25%',
      height: '115.33%',
    },
  ),
  make(
    'catalog-8',
    'RADO',
    22000,
    catalog8,
    'Наручные часы RADO на стальном браслете',
    {
      left: '16.46%',
      top: '21%',
      width: '67.87%',
      height: '67.33%',
    },
  ),
]

export const STRAPS: Product[] = [
  make(
    'strap-1',
    'GEORG JENSEN',
    6500,
    strap1,
    'Коричневый кожаный ремешок Georg Jensen',
    {
      left: '-31.94%',
      top: '-42.55%',
      width: '168.06%',
      height: '202.21%',
    },
  ),
  make('strap-2', 'NATO', 3200, strap2, 'Чёрный ремешок NATO', {
    left: '-36.58%',
    top: '-10.96%',
    width: '181.78%',
    height: '172.19%',
  }),
  make('strap-3', 'SPARK', 5400, strap3, 'Светло-коричневый ремешок Spark', {
    left: '-32.48%',
    top: '-22.99%',
    width: '171.9%',
    height: '162.83%',
  }),
]

export const VIEWED: Product[] = [
  make(
    'viewed-1',
    'TECHNE',
    15700,
    viewed1,
    'Наручные часы TECHNE на рыжем ремешке с белой строчкой',
    {
      left: '6.94%',
      top: '-2.9%',
      width: '93.06%',
      height: '105.79%',
    },
  ),
  make(
    'viewed-2',
    'TECHNE',
    15700,
    viewed2,
    'Наручные часы TECHNE со стальным корпусом',
    {
      left: '-8.89%',
      top: '-21.69%',
      width: '123.06%',
      height: '139.9%',
    },
  ),
  make(
    'viewed-3',
    'TECHNE',
    22700,
    viewed3,
    'Наручные часы TECHNE с титановым корпусом',
    {
      left: '-5.28%',
      top: '-15.72%',
      width: '117.5%',
      height: '133.58%',
    },
  ),
]

export const POPULAR: Product[] = [
  make(
    'popular-1',
    'RADO',
    65300,
    popular1,
    'Наручные часы RADO на чёрном ремешке',
    {
      left: '4.15%',
      top: '-5.33%',
      width: '92.33%',
      height: '109.05%',
    },
  ),
  make(
    'popular-2',
    'BVLGARI',
    81700,
    popular2,
    'Наручные часы BVLGARI на коричневом ремешке',
    {
      left: '3.83%',
      top: '-3.04%',
      width: '92.33%',
      height: '109.05%',
    },
  ),
  make(
    'popular-3',
    'BVLGARI',
    72700,
    popular3,
    'Наручные часы BVLGARI с золотым безелем',
    {
      left: '9.64%',
      top: '-1.28%',
      width: '80.61%',
      height: '95.21%',
    },
  ),
]

export const PRODUCT: Product = make(
  'kulte-26',
  'KULTE, 26 ММ',
  12700,
  CATALOG[0]?.image ?? catalog1,
  'Часы KULTE, вид спереди на чёрном сетчатом браслете',
  { left: '0', top: '0', width: '100%', height: '100%' },
)

export const ALL: Product[] = [
  PRODUCT,
  ...CATALOG,
  ...POPULAR,
  ...STRAPS,
  ...VIEWED,
]

export interface Entry {
  id: string
  brand: string
  price: string
}

export const INDEX: Entry[] = ALL.map(({ id, brand, price }) => ({
  id,
  brand,
  price,
}))
