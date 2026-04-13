const handleChapterClick = async (chapterIndex) => {
  // Update local state so the UI changes immediately
  setCurrentChapter(chapterIndex);

  // If the user is logged in, save to SQL
  if (user) {
    try {
      await saveProgress({
        userId: user.id,
        comicSlug: currentComic.slug,
        chapterIndex: chapterIndex
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  }
};