import React from 'react'
import { Banner } from 'src/components/common'
import s from './HomeBanner.module.scss'
import BannerImgRight from './assets/banner_full.png'

interface Props {
    className?: string
    children?: any
}

const HomeBanner = ({ }: Props) => {
    return (
        <div className={s.homeBanner}>
            <section className={s.left}>
                <div className={s.text}>
                    Freshness<br/>guaranteed
                </div>
            </section >
            <Banner
                title="Save 15% on your first order"
                subtitle="Last call! Shop deep deals on 100+ bulk picks while you can."
                imgLink={BannerImgRight.src}
                type="small"
            />
        </div >
    )
}

export default HomeBanner
