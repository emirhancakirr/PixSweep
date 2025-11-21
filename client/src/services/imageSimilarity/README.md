# Image Similarity Detection

Client-side perceptual hashing service for detecting similar photos (e.g., burst shots, similar scenes).

## Features

- **dHash (Difference Hash)** algorithm implementation
- Fully client-side using Canvas API
- No external dependencies or ML models
- Configurable similarity threshold
- Progress tracking support

## Usage

### Basic Usage

```typescript
import { useImageSimilarity } from "../../hooks/useImageSimilarity";
import { usePhotosStore } from "../../state/usePhotosStore";

function MyComponent() {
  const photos = usePhotosStore((s) => s.photos);
  const { clusterPhotos, isProcessing, progress } = useImageSimilarity({
    threshold: 10, // Hamming distance threshold (default: 10)
    hashWidth: 9, // Hash width (default: 9)
    hashHeight: 8, // Hash height (default: 8)
  });

  const handleCluster = async () => {
    const clusters = await clusterPhotos(photos);
    console.log(`Found ${clusters.length} similarity clusters`);

    clusters.forEach((cluster) => {
      console.log(`Cluster with ${cluster.photos.length} similar photos:`);
      cluster.photos.forEach((photo) => console.log(`  - ${photo.name}`));
    });
  };

  return (
    <button onClick={handleCluster} disabled={isProcessing}>
      {isProcessing ? `Processing ${progress.current}/${progress.total}...` : "Find Similar Photos"}
    </button>
  );
}
```

### Check if Two Photos are Similar

```typescript
import { arePhotosSimilar } from "../../services/imageSimilarity";

const isSimilar = await arePhotosSimilar(photo1, photo2, {
  threshold: 10, // Lower = stricter (default: 10)
});
```

### Find Similar Photos for a Target

```typescript
import { findSimilarPhotos } from "../../services/imageSimilarity";

const similar = await findSimilarPhotos(targetPhoto, candidatePhotos, { threshold: 10 });
```

### Compute Hash for a Single Photo

```typescript
import { computePhotoHash } from "../../services/imageSimilarity";

const hash = await computePhotoHash(photo);
console.log(hash.hashString); // Hex representation
console.log(hash.hash); // BigInt
```

## Algorithm Details

### dHash (Difference Hash)

1. Resize image to 10×8 (width+1 × height)
2. Convert to grayscale
3. Compare each pixel with its right neighbor
4. Generate 72-bit hash (9×8)
5. Compute Hamming distance between hashes

### Threshold Guidelines

- **0-5**: Very similar (nearly identical)
- **6-10**: Similar (same scene, minor differences)
- **11-15**: Somewhat similar
- **16+**: Different

Adjust threshold based on your use case. Lower values = stricter matching.

## Performance

- Processing time: ~50-200ms per photo (depending on image size)
- Memory: Minimal (processes images one at a time)
- Works with HEIC files (uses preview URLs if available)

## Integration Example

```typescript
// In your review flow
import { clusterSimilarPhotos } from "../../services/imageSimilarity";

// After loading photos
const clusters = await clusterSimilarPhotos(
  photos,
  {
    threshold: 10,
  },
  (current, total) => {
    console.log(`Processing ${current}/${total}`);
  }
);

// Group similar photos for review
clusters.forEach((cluster) => {
  // Show cluster representative first
  // Allow user to review similar photos together
});
```
