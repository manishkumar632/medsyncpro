import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import ExploreCategories from '../components/ExploreCategories';
import DealHotOfMonth from '../components/DealHotOfMonth';
import PromoBanners from '../components/PromoBanners';
import TopSelling from '../components/TopSelling';
import CategoryGrid from '../components/CategoryGrid';
import DealsOfTheDay from '../components/DealsOfTheDay';
import FeaturedBrands from '../components/FeaturedBrands';
import MobileAppBanner from '../components/MobileAppBanner';
import WellnessEssentials from '../components/WellnessEssentials';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div>
            <Header />
            <HeroBanner />
            <ExploreCategories />
            <DealHotOfMonth />
            <PromoBanners />
            <TopSelling />
            <CategoryGrid />
            <DealsOfTheDay />
            <FeaturedBrands />
            <MobileAppBanner />
            <WellnessEssentials />
            <Footer />
        </div>
    );
};

export default Home;
