import { useState, useEffect } from 'react';
import { Search, ChevronRight, Heart, MessageCircle, Filter, Grid, Compass } from 'lucide-react';
import NavBar from '../NavBar/NavBar';

// Sample data for posts
const generatePosts = () => {
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Street Food', 'Vegan', 'Seafood'];
  const usernames = ['foodie_jane', 'chef_mike', 'taste_hunter', 'culinary_dreams', 'sweet_tooth', 'spice_master'];
  const locations = ['New York', 'Tokyo', 'Paris', 'Bangkok', 'Mexico City', 'Istanbul', 'Rome'];
  
  // Food-specific image URLs
  const foodImages = [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',  // pasta
    'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',  // burger
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',  // breakfast
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',    // pancakes
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',    // pizza
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg',  // dessert
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',  // steak
    'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg',  // sushi
    'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',  // drink
    'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',    // salad
    'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg',  // seafood
    'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg',    // asian food
    'https://images.pexels.com/photos/3186654/pexels-photo-3186654.jpeg',  // fine dining
    'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',  // ice cream
    'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',  // coffee
    'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg',  // cheese plate
    'https://images.pexels.com/photos/3681641/pexels-photo-3681641.jpeg',  // tacos
    'https://images.pexels.com/photos/3026805/pexels-photo-3026805.jpeg',  // cupcakes
  ];
  
  return Array(18).fill().map((_, i) => ({
    id: i + 1,
    imageUrl: foodImages[i],
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 200) + 5,
    caption: `Delicious ${categories[i % categories.length]} that I couldn't resist sharing! #foodlover #delicious #eatogram`,
    username: usernames[i % usernames.length],
    location: locations[i % locations.length],
    category: categories[i % categories.length],
    isPopular: Math.random() > 0.7
  }));
};

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('grid');
  
  const categories = ['All', 'Trending', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Street Food'];
  
  useEffect(() => {
    // Simulate fetching data
    setPosts(generatePosts());
  }, []);
  
  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Trending') return post.isPopular;
    return post.category === selectedCategory;
  }).filter(post => {
    if (!searchQuery) return true;
    return post.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
           post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            
            
          </div>
         
          
        </div>
      </header>

      {/* Categories Horizontal Scroll */}
      <div className="bg-white sticky top-16 z-10 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 gap-3 no-scrollbar">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Picks */}
      {selectedCategory === 'All' && (
        <div className="bg-white py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Popular Picks</h2>
              <button className="flex items-center text-rose-500 font-medium">
                See all <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {posts.filter(post => post.isPopular).slice(0, 6).map(post => (
                <div key={post.id} className="min-w-[280px] rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img 
                    src={post.imageUrl} 
                    alt={`Food by ${post.username}`} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{post.username}</div>
                      <div className="text-xs text-gray-500">{post.location}</div>
                    </div>
                    <div className="flex items-center text-gray-700 text-sm">
                      <div className="flex items-center mr-4">
                        <Heart size={16} className="mr-1 text-rose-500" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={16} className="mr-1" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for</p>
          </div>
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-transform hover:shadow-md hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={post.imageUrl} 
                    alt={`Food by ${post.username}`} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-white">{post.username}</div>
                      <div className="text-xs text-gray-200">{post.location}</div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm text-gray-600 mb-2 line-clamp-2">{post.caption}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 text-sm">
                      <div className="flex items-center mr-4">
                        <Heart size={16} className="mr-1 text-rose-500" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={16} className="mr-1" />
                        {post.comments}
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {post.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="flex bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <img 
                  src={post.imageUrl} 
                  alt={`Food by ${post.username}`} 
                  className="w-32 h-32 sm:w-48 sm:h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{post.username}</div>
                    <div className="text-xs text-gray-500">{post.location}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 flex-grow">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 text-sm">
                      <div className="flex items-center mr-4">
                        <Heart size={16} className="mr-1 text-rose-500" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={16} className="mr-1" />
                        {post.comments}
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {post.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;