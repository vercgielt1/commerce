import commerce from '@lib/api/commerce';
import { GetStaticPropsContext } from 'next';
import { BlogEmpty, Layout } from 'src/components/common';
import { BlogCardProps } from 'src/components/common/CardBlog/CardBlog';
import { BlogBreadCrumb, BlogHeading, BlogsList, FeaturedCardBlog } from 'src/components/modules/blogs';
import { DEFAULT_BLOG_PAGE_SIZE, REVALIDATE_TIME } from "src/utils/constanst.utils";
import { formatDate, getAllPromies } from 'src/utils/funtion.utils';
import { PromiseWithKey, SortOrder } from 'src/utils/types.utils';

interface Props {
    blogs?: BlogCardProps[],
    featuredBlog?: BlogCardProps[],
    totalItems: number
}
export default function BlogsPage({ blogs, featuredBlog, totalItems }:Props) {

    return(
        <>
            <BlogBreadCrumb />
            <BlogHeading />
            { (featuredBlog?.length !==0 ) &&
              <FeaturedCardBlog 
              title={featuredBlog?.[0]?.title} 
              slug={featuredBlog?.[0]?.slug} 
              imgSrc={featuredBlog?.[0]?.imageSrc ?? null}
              content={featuredBlog?.[0]?.description}
              imgAuthor={featuredBlog?.[0]?.authorAvatarAsset ?? null}
              authorName={featuredBlog?.[0]?.authorName}
              date={formatDate(featuredBlog?.[0]?.createdAt ?? '')}
              />
            }
           
            {
              (blogs?.length !== 0) && 
              <BlogsList blogList={blogs} total={totalItems} idFeatured={featuredBlog?.[0]?.id} />
            }
            {
              (blogs?.length === 0 && featuredBlog?.length === 0 ) &&  <BlogEmpty />
            }
        </>
    )
}


export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  let promisesWithKey = [] as PromiseWithKey[]
  let props = {} as any;

  const {featuredBlogs} = await commerce.getFeaturedBlog({
    variables: {
      take: 1,
      sort:{
        updateAt: SortOrder.Desc
      }
    },
    config,
    preview,
  })
  
 // Blogs
  const idFeaturedBlog = featuredBlogs?.[0]?.id;
  const blogsPromise = commerce.getAllBlogs({
    variables: {
      excludeBlogIds: [idFeaturedBlog],
      take: DEFAULT_BLOG_PAGE_SIZE,
    },
    config,
    preview,
  })
  promisesWithKey.push({ key: 'blogs', promise: blogsPromise , keyResult: 'blogs'  })


  try {
    const promises = getAllPromies(promisesWithKey)
    const rs = await Promise.all(promises)

    promisesWithKey.map((item, index) => {
      props[item.key] = item.keyResult ? rs[index][item.keyResult] : rs[index]
      return null
    })

    props.featuredBlog = featuredBlogs;
    
   
    return {
      props,
      revalidate: REVALIDATE_TIME
    }
  } catch (err) {

  }
}


BlogsPage.Layout = Layout
