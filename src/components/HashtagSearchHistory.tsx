
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HashtagSearchHistoryProps {
  onSelectSearchTerm: (term: string) => void;
}

export const HashtagSearchHistory = ({ onSelectSearchTerm }: HashtagSearchHistoryProps) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Load search history when the component mounts or when the sheet is opened
    if (open) {
      fetchSearchHistory();
    }
  }, [open]);

  const fetchSearchHistory = async () => {
    setLoading(true);
    try {
      // Get unique search terms from the searches table
      const { data, error } = await supabase
        .from('searches')
        .select('search_term')
        .order('searched_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract unique search terms
      const uniqueTerms = Array.from(new Set(data.map(item => item.search_term)));
      setSearchHistory(uniqueTerms);
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTerm = (term: string) => {
    onSelectSearchTerm(term);
    setOpen(false); // Close the sheet after selection
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="ml-2 relative"
          title="Search History"
        >
          <Clock className="h-5 w-5 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Search History</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : searchHistory.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {searchHistory.map((term) => (
                  <li key={term}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left font-normal hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSelectTerm(term)}
                    >
                      #{term}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No search history found
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
