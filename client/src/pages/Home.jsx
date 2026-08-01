import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import Nouveautes from '../components/home/Nouveautes';
import Tendances from '../components/home/Tendances';
import BrandValues from '../components/home/BrandValues';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Nouveautes />
      <Tendances />
      <BrandValues />
      <Newsletter />
    </>
  );
}
