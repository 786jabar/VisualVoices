import { FC } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  ImageIcon, 
  Sparkles,
  PlayCircle, 
  Layers,
  Save
} from 'lucide-react';

const LandingPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-7 w-7 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Vocal Earth</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
            Transform Your <span className="text-indigo-400">Voice</span> Into Surreal <span className="text-indigo-400">Worlds</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Speak your imagination into existence. Create stunning visual landscapes through the power of your voice, sentiment, and AI-enhanced creativity.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/create">
              <Button className="h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Start Creating
              </Button>
            </Link>
            
            <Link href="/gallery">
              <Button variant="outline" className="h-14 px-8 text-base border-indigo-400 text-indigo-400 hover:bg-indigo-950 flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="rounded-full bg-indigo-900/50 w-12 h-12 flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Speak to Create</h3>
            <p className="text-gray-300">Your voice transforms into a dynamic visual landscape that evolves with your words and emotions.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="rounded-full bg-indigo-900/50 w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Poetry</h3>
            <p className="text-gray-300">Receive AI-generated poetic interpretations of your spoken words, enhancing your creative expression.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="rounded-full bg-indigo-900/50 w-12 h-12 flex items-center justify-center mb-4">
              <Save className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Save & Share</h3>
            <p className="text-gray-300">Capture your unique creations, build a personal gallery, and revisit your imagination anytime.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400 border-t border-gray-800">
        <p>Vocal Earth — Transform your voice into surreal visual landscapes</p>
      </footer>
    </div>
  );
};

export default LandingPage;