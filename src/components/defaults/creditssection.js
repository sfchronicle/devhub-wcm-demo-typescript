import React, {Fragment} from 'react'
import Credits from './credits'
import CreditLine from './creditline'
import MiscCredit from './misccredit'
import * as creditssectionStyles from '../../styles/modules/creditssection.module.less'
import ReactTooltip from 'react-tooltip'
import Email from '../icons/email'
import Twitter from '../icons/twitter'
import Instagram from '../icons/instagram'
import '../../styles/credittooltip.less'

// Get credits
let rawCredits = require("../../data/credits.sheet.json").slice(1);
// Put credits into structured array
let creditObj = {};
for (var credit in rawCredits){
  if (typeof creditObj[rawCredits[credit].Role] === "undefined"){
    // Create an empty array with key of role
    creditObj[rawCredits[credit].Role] = [];
  }
  // Push into role array regardless
  creditObj[rawCredits[credit].Role].push(rawCredits[credit]);
}

const CreditsSection = () => (
  <section aria-label="Credits" className={creditssectionStyles.section}>
    <h4 className={creditssectionStyles.hed}>Credits</h4>

      { Object.keys(creditObj).map(function(key, k) {
          return (
            <Fragment key={"credits"+k}>
              <Credits type={key}>
                { creditObj[key].map((credit, i) => {
                  return <Fragment key={"creditline"+i}>
                    {(i < creditObj[key].length - 1 && i > 0) &&
                      <span>, </span>
                    }
                    {(i > 0 && i === creditObj[key].length - 1) &&
                      <span> and </span>
                    }
                    <CreditLine key={"credit"+i} name={credit.Name} organization={credit.Organization} email={credit.Email} twitter={credit.Twitter} instagram={credit.Instagram}/>
                  </Fragment>
                })}
              </Credits>
              {(k < Object.keys(creditObj).length) &&
                <span>. </span>
              }
            </Fragment>
          )
      })}
      {//Icons by <MiscCredit text={"Font Awesome / CC BY."} link={"https://fontawesome.com/"} />
      }

      <ReactTooltip
        delayHide={1000}
        getContent={(data) => {
          // Ingest the JSON from the data-tip
          if (!data || data === '{}'){
            return null
          } else {
            data = JSON.parse(data)
          }
          const {email, twitter, instagram} = data
          return <div className='flex-contact'>
            {' '}{email && (
              <span>
              <a href={`mailto:${email} `}>{<Email />}</a>{' '}
              </span>
            )}
            {twitter && (
              <span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://twitter.com/${twitter} `}
                >
                  {<Twitter />}
                </a>
              </span>
            )}
            {instagram && (
              <span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://instagram.com/${instagram} `}
                >
                  {<Instagram />}
                </a>
              </span>
            )}
          </div>
        }}
        type="light"
        borderColor="#ccc"
        border={true}
        className="tooltip"
        effect="solid"
        event="click"
        eventOff="mouseleave"
        overridePosition={(pos, currentEvent, currentTarget, node) => {
          // Make sure the tooltip appears right where the mouse is, because otherwise it can show in odd places for links that break across lines
          let widthHalf = node.offsetWidth/2
          return {left: currentEvent.clientX - widthHalf, top: currentEvent.clientY - 50}
        }}
      />
    </section>

)

export default CreditsSection
