import { usePhotosStore } from "./state/usePhotosStore";
import Welcome from "./features/review/Welcome";
import { ReviewPage } from "./features/review/ReviewPage";

export default function App() {
  const hasPhotos = usePhotosStore(s => s.photos.length > 0);

  return (
    <>
      {hasPhotos ? (
        <ReviewPage />
      ) : (
        <Welcome />
      )}
    </>
  );
}