import React from 'react'
import * as styles from '../../styles/modules/sponsorbug.module.less'

let sponsorSettings;
try {
  sponsorSettings = require('../../data/sponsor_settings.sheet.json')
  sponsorSettings = sponsorSettings[0]
} catch (err){
  // It's cool
}
let has_image = "";
let has_link = "";

if (sponsorSettings) {
  has_image = sponsorSettings.Sponsor_Image
  has_link = sponsorSettings.Sponsor_Link
}

let SponsorBug = () => {
  if (!sponsorSettings){
    return null
  }
  else {
    return (
      <>
      <div className={styles.container}>
        <div className={styles.bgWrapper}>
        {has_image &&
          <img className={styles.logo} src={sponsorSettings.Sponsor_Image} />
        }
        {has_link ? <div className={styles.helperText}><a href={sponsorSettings.Sponsor_Link}>{sponsorSettings.Sponsor_Text} <span>{sponsorSettings.Sponsor_Name}</span></a></div>  : <div className={styles.helperText}>{sponsorSettings.Sponsor_Text} <span>{sponsorSettings.Sponsor_Name}</span></div>
        }
        </div>
      </div>
      </>
    )
  }
}
export default SponsorBug;
