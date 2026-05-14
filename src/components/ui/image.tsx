import { cn } from '@/lib/utils'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import type { LazyLoadImageProps } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { forwardRef } from 'react'

export interface ImageProps
  extends Omit<LazyLoadImageProps, 'src' | 'alt' | 'placeholder'> {
  /** Image source URL */
  src: string | undefined
  /** Alt text for accessibility */
  alt: string
  /** Custom CSS classes */
  className?: string
  /** Fallback image URL when the main image fails to load */
  fallbackSrc?: string
  /** Whether to show loading blur effect */
  showBlurEffect?: boolean
  /** Custom loading placeholder */
  placeholder?: React.ReactNode
  /** Callback when image loads successfully */
  onImageLoad?: () => void
  /** Callback when image fails to load */
  onImageError?: (error: Event) => void
}

/**
 * Enhanced Image component with lazy loading, error handling, and accessibility features
 *
 * @param src - The source URL of the image
 * @param alt - Alt text for accessibility (required)
 * @param className - Additional CSS classes
 * @param fallbackSrc - Fallback image when main image fails (defaults to '/image-break.png')
 * @param showBlurEffect - Whether to show blur effect during loading (default: true)
 * @param placeholder - Custom loading placeholder component
 * @param onImageLoad - Callback when image loads successfully
 * @param onImageError - Callback when image fails to load
 * @param props - Additional LazyLoadImage props
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      className,
      fallbackSrc = '/image-break.png',
      showBlurEffect = true,
      placeholder,
      onImageLoad,
      onImageError,
      effect = 'blur',
      ...props
    },
    ref,
  ) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.currentTarget

      // Prevent infinite error loops
      if (!target.dataset.errorHandled) {
        target.dataset.errorHandled = 'true'
        target.src = fallbackSrc

        // Call custom error handler if provided
        onImageError?.(e.nativeEvent)
      }
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.currentTarget

      if (showBlurEffect) {
        target.classList.remove('opacity-50', 'blur-sm')
        target.classList.add('opacity-100')
      }

      // Call custom load handler if provided
      onImageLoad?.()
    }

    return (
      <div className={cn("relative", className)}>
        {placeholder && (
          <div className="absolute inset-0 flex items-center justify-center">
            {placeholder}
          </div>
        )}

        <LazyLoadImage
          src={src}
          alt={alt}
          effect={effect}
          width={width ?? '100%'}
          height={height ?? '100%'}
          className={cn(
            'transition-all duration-300',
            showBlurEffect && 'opacity-50 blur-sm',
            // Default rounded corners only if no custom class overrides
            !className?.includes('rounded') && 'rounded-xl',
            className,
          )}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          {...props}
        />
      </div>
    )
  },
)

Image.displayName = 'Image'

export default Image