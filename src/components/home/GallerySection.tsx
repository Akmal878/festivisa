const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    alt: 'Wedding ceremony',
    className: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    alt: 'Wedding decoration',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop',
    alt: 'Wedding venue',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop',
    alt: 'Wedding couple',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?w=400&h=300&fit=crop',
    alt: 'Wedding rings',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop',
    alt: 'Wedding reception',
    className: 'col-span-2 row-span-1',
  },
];

export function GallerySection() {
  return (
    <section className="py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-subheading justify-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">Gallery</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white">
            Magical Moments
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mt-6 text-lg">
            A glimpse into the beautiful celebrations we've helped create.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`${image.className} group relative overflow-hidden rounded-2xl cursor-pointer`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-strong">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
