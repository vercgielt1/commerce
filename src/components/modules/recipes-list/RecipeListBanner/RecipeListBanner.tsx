import React from 'react'
import { Banner } from 'src/components/common'
import { BannerItemProps } from 'src/components/common/Banner/BannerItem/BannerItem'
import BannerRight from './assets/bannerrecipes.png'
import s from './RecipeListBanner.module.scss'

const DEFAULT_BANNER: BannerItemProps[] =   [{
    title: "Save 15% on your first order",
    subtitle: "Last call! Shop deep deals on 100+ bulk picks while you can.",
    imgLink: BannerRight.src,
    size: "large",
},
]
interface Props {
    banners: BannerItemProps[]
}

const RecipeListBanner = ({banners }: Props) => {
    return (
        <div className={s.recipeListBanner}>
            <Banner
                data={banners.length !== 0 ? banners : DEFAULT_BANNER}
                size="large"
            />
        </div >
    )
}

export default RecipeListBanner
