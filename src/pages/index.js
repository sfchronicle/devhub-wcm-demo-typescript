import React, { useEffect } from 'react'
import { graphql } from 'gatsby'
import PropTypes from 'prop-types'
// import useSWR from 'swr'
// import { getData } from '../components/defaults/component-helpers/requesthelpers'
import Layout from '../components/layout'
import WCMImage from '../components/defaults/wcmimage'
import DropCap from '../components/defaults/dropcap'
import { useCanNativeLazyLoad } from '../components/defaults/component-helpers/customhooks'
import Topper from '../components/defaults/topper'
import RelatedSection from '../components/defaults/relatedsection'
import CreditsSection from '../components/defaults/creditssection'
import Ad from '../components/defaults/ad'
import Newsletter from '../components/defaults/newsletter'
import SponsorBug from '../components/defaults/sponsorbug'
import CongressChartWrapper from '../components/test-components/congresschartwrapper'
import { applyScrollDepthTracking } from '../components/defaults/component-helpers/utilfunctions'
let rawCredits;
try {
	rawCredits = require('../data/credits.sheet.json')
} catch (err){
    // It's fine
    rawCredits = null;
}
let related_links;
try{
  related_links = require('../data/related_links.sheet.json').slice(1)
} catch(err){
  related_links = require('../data/presets/related_links.json')
}
let storySettings;
try {
	storySettings = require ('../data/story_settings.sheet.json')
} catch(err){
	//It's fine
	storySettings = null;
}
const IndexPage = ({ data }) => {
  // easy hooks based request library
  // const { data: responseData, error } = useSWR('https://api.kanye.rest', getData, {
  //   onSuccess: (data) => console.log(data),
  //   onError: (err) => console.log(err),
  // })


  // custom hook checks for nativelazyload
  const lazy = useCanNativeLazyLoad()

  useEffect(() => {
    // Set up scroll analytics
    applyScrollDepthTracking()
  }, [])

  const {
    site: { siteMetadata }
  } = data

	const has_sponsor = storySettings[0].Is_Sponsored === 'TRUE'

  return (
    <Layout meta={siteMetadata}>
      <Topper meta={siteMetadata} />
			{has_sponsor && <SponsorBug />}
      <main>
        <article>
          <p>
            <DropCap>T</DropCap>
            he Savage nodded, frowning. "You got rid of them. Yes, that's just
            like you. Getting rid of everything unpleasant instead of learning
            to put up with it. Whether 'tis better in the mind to suffer the
            slings and arrows or outrageous fortune, or to take arms against a
            sea of troubles and by opposing end them... But you don't do either.
            Neither suffer nor oppose. You just abolish the slings and arrows.
            It's too easy."
          </p>

          <p>
            The Savage nodded, frowning. "You got rid of them. Yes, that's just
            like you. Getting rid of everything unpleasant instead of learning
            to put up with it. Whether 'tis better in the mind to suffer the
            slings and arrows or outrageous fortune, or to take arms against a
            sea of troubles and by opposing end them... But you don't do either.
            Neither suffer nor oppose. You just abolish the slings and arrows.
            It's too easy."
          </p>

          <CongressChartWrapper />

          <p>
            The Savage nodded, frowning. "You got rid of them. Yes, that's just
            like you. Getting rid of everything unpleasant instead of learning
            to put up with it. Whether 'tis better in the mind to suffer the
            slings and arrows or outrageous fortune, or to take arms against a
            sea of troubles and by opposing end them... But you don't do either.
            Neither suffer nor oppose. You just abolish the slings and arrows.
            It's too easy."
          </p>

          <Ad adLetter="A" />

          <Newsletter />
        </article>
      </main>

      <RelatedSection links={related_links} />
      <CreditsSection />
    </Layout>
  )
}

export const query = graphql`
  {
    site {
      siteMetadata {
        EMBEDDED
        MAIN_DOMAIN
        PAYWALL_SETTING
        PROJECT {
          AUTHORS {
            AUTHOR_NAME
            AUTHOR_PAGE
          }
          DATE
          DESCRIPTION
          HEARST_CATEGORY
          KEY_SUBJECTS
          DECK
          DISPLAY_TITLE
          IMAGE
          ISO_MODDATE
          ISO_PUBDATE
          OPT_SLASH
          SLUG
          SOCIAL_TITLE
          SUBFOLDER
          TITLE
          TWITTER_TEXT
          ANALYTICS_CREDIT
          MARKET_KEY
          CANONICAL_URL
        }
      }
    }
  }
`
IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default IndexPage
