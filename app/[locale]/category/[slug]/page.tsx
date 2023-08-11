import Search from '@/components/search/search';
import SearchResult from '@/components/search/search-result';
import { categoryQuery } from '@/lib/sanity/queries';
import { clientFetch } from '@/lib/sanity/sanity.client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const category = await clientFetch(categoryQuery, params);

  if (!category) return notFound();

  return {
    title: category.seo.title || category.title,
    description: category.seo.description || category.description
  };
}

interface CategoryPageParams {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ProductPage({ params }: CategoryPageParams) {
  const category = await clientFetch(categoryQuery, params);

  if (!category) return notFound();

  const { title } = category;

  return (
    <div className="my-8 flex w-full flex-col px-4 lg:my-12 lg:px-8 2xl:px-16">
      <Search isCategory placeholder={title.toLowerCase()} title={title}>
        <SearchResult />
      </Search>
    </div>
  );
}
