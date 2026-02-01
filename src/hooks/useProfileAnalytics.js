import { useState, useEffect } from 'react';

export const useProfileAnalytics = (publications) => {
  const [analytics, setAnalytics] = useState({
    weeklyViews: 0,
    monthlyViews: 0,
    topPerformingItems: [],
    recentActivity: []
  });

  useEffect(() => {
    if (!publications) return;
    
    const calculateAnalytics = () => {
      const now = new Date();
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      const weeklyViews = publications.reduce((sum, pub) => {
        const viewsThisWeek = pub.viewsHistory?.filter(v => 
          new Date(v.date) > oneWeekAgo
        ).length || 0;
        return sum + viewsThisWeek;
      }, 0);

      const monthlyViews = publications.reduce((sum, pub) => {
        const viewsThisMonth = pub.viewsHistory?.filter(v => 
          new Date(v.date) > oneMonthAgo
        ).length || 0;
        return sum + viewsThisMonth;
      }, 0);

      const topPerformingItems = [...publications]
        .sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
        .slice(0, 5);

      setAnalytics({
        weeklyViews,
        monthlyViews,
        topPerformingItems,
        recentActivity: publications.slice(0, 5)
      });
    };

    calculateAnalytics();
  }, [publications]);

  return analytics;
};
