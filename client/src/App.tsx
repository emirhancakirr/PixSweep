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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Welcome />
        </div>
      )}
    </>
  );
}