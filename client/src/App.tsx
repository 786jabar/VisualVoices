import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import GalleryItem from "@/pages/GalleryItem";
import LandingPage from "@/pages/LandingPage";
import Explore from "@/pages/Explore";
import Landscapes from "@/pages/Landscapes";
import UserAnimations from "@/pages/UserAnimations";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/create" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/gallery/:id" component={GalleryItem} />
      <Route path="/explore" component={Explore} />
      <Route path="/landscapes" component={Landscapes} />
      <Route path="/my-animations" component={UserAnimations} />
      <Route path="/landscape/:id" component={LandscapePlayerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
