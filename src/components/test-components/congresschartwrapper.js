import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import { getData } from './helpers/requesthelpers'
import LegislatureChart from './legislaturechart'
import LegislatureBar from './legislaturebar'
import LegislatureLegend from './legislaturelegend'
import * as ChartStyles from '../../styles/modules/chart.module.less'

const enumerateCandidates = function(staticData, dynamicData, office, isLocal){
  let candidates = [];
  let voteTotal = 0;
  let calledRace = false;
  // If it's local, the dynamic and static are rolled into static, so copy it over
  if (isLocal){
    staticData = dynamicData
  }

  // Sometimes candidates are directly on the key, sometimes they are nested inside "c", check both
  
  let staticCand = staticData.c
  if (!staticCand){
    staticCand = staticData
  }
  // Adding a log in case we get an out-of-sync failure
  if (!dynamicData){
    console.log("dynamicData missing for", office, staticCand)
    // We're going to fake a dynamic object with 0 votes
    const cObj = {}
    Object.keys(staticCand).forEach((item) => {
      cObj[item] = 0
    })
    dynamicData = {
      c: cObj,
      r: [],
      w: [],
      vp: 0
    }
  }
  let dynamicCand = dynamicData.c
  if (!dynamicCand){
    dynamicCand = dynamicData
  }

  Object.keys(staticCand).forEach(function(key,index) {
    // Check if we have corresponding dynamic data for this static file
    // If not, continue without this one
    if (typeof dynamicData === "undefined" || typeof dynamicCand[key] === "undefined"){
      // console.log("Candidate " + key + " not found! Do you need to regenerate the static file?")
      return;
    }

    let totalVotes = dynamicCand[key].v;
    // If not presidential, votes are logged directly at the key, so check:
    if (!totalVotes && totalVotes !== 0){
      totalVotes = dynamicCand[key];
    }

    // Make sure we get name or n, wherever it's stored
    let name = staticCand[key].n || staticCand[key].name;

    // Create object for array
    let newCandidate = {
      name: name || key, // The name will be the key in the local files
      party: staticCand[key].party || staticCand[key].p,
      votes: totalVotes
    }

    // Standardize party
    if (newCandidate.party){
      if (newCandidate.party.toLowerCase() === "democrat"){
        newCandidate.party = "Dem";
      } else if (newCandidate.party.toLowerCase() === "republican"){
        newCandidate.party = "GOP";
      } else {
        if (newCandidate.party.length > 3){
          newCandidate.party = newCandidate.party.substring(0,3)
        }
      }
    }

    // Check incumbent status
    if (staticCand[key].i){
      newCandidate.incumbent = true;
    }
    // Check for winner status
    if (dynamicData.w){
      if (dynamicData.w.indexOf(key) !== -1){
        newCandidate.winner = true;
        calledRace = true;
      }
    } else {
      // If there's no w property, consider this called (it's probably county-level)
      calledRace = true;
    }

    // Check for runoff status
    if (dynamicData.r){
      if (dynamicData.r.indexOf(key) !== -1){
        newCandidate.runoff = true;
      }
    }

    // Add to total votes
    voteTotal += totalVotes;

    // Add to array
    candidates.push(newCandidate);
  });

  // If office was not supplied, pull it out of the data
  if (!office){
    office = staticData.name;
  }

  // Format an obj for the return
  let returnObj = {
  	office: office,
  	candidates: candidates,
  	voteTotal: voteTotal,
    calledRace: calledRace,
    countedPrecincts: dynamicData.pr,
    totalPrecincts: staticData.pt,
    votePercent: dynamicData.vp,
  }

  // If there can be multiple winners, make that clear
	if (staticData.s && staticData.s > 1){
		returnObj.totalWinners = parseInt(staticData.s);
	}
  // Return all candidates
  return returnObj;
}

// source: https://www.270towin.com/2022-senate-election/
const baseSenateCounts = {
  Dem: 34,
  GOP: 29,
  Other: 2
}
// source: https://www.270towin.com/2022-house-election/
const baseHouseCounts = {
  Dem: 0,
  GOP: 0
}

const CongressChartWrapper = ({
  dataStatic,
  dataDynamic,
  threshold = 35,
  showTooltip = true,
  noSeats = false
}) => {

  // array of objects for each seat via enumerateCandidates() utility function
  const [calledHouse, setCalledHouse] = useState([])
  const [calledSenate, setCalledSenate] = useState([])

  // will be dictionaries with key = party & value = number of seats called
  const [calledHouseCounts, setCalledHouseCounts] = useState({Dem: 0, GOP: 0})
  const [calledSenateCounts, setCalledSenateCounts] = useState({Dem: 0, GOP: 0})

  // array of objects for each seat via enumerateCandidates() utility function
  // - above expected vote threshold (default: 35%)
  const [votingHouse, setVotingHouse] = useState([])
  const [votingSenate, setVotingSenate] = useState([])
  // - below expected vote threshold (default: 35%)
  const [subThresholdHouse, setSubThresholdHouse] = useState([])
  const [subThresholdSenate, setSubThresholdSenate] = useState([])

  // will be dictionaries with key = party & value = number of seats called
  // - leaning party as key for seats above expected vote threshold (default: 35%)
  // - also have a sub index for those below threshold
  const [votingHouseCounts, setVotingHouseCounts] = useState({Dem: 0, GOP: 0, x: 0})
  const [votingSenateCounts, setVotingSenateCounts] = useState({Dem: 0, GOP: 0, x: 0})

  useEffect(() => {
    if(!dataStatic || !dataDynamic) return

    let enumeratedHouse = []
    let enumeratedSenate = []
    Object.keys(dataStatic['U.S. House']).forEach(race => {
      const enumerated = enumerateCandidates(dataStatic['U.S. House'][race], dataDynamic['U.S. House'][race], race, false)
      enumeratedHouse.push(enumerated)
    })
    Object.keys(dataStatic['U.S. Senate']).forEach(race => {
      if (!race.includes('2016')) {
        const enumerated = enumerateCandidates(dataStatic['U.S. Senate'][race], dataDynamic['U.S. Senate'][race], race, false)
        enumeratedSenate.push(enumerated)
      }
    })

    // ORDER OF PARTIES IN VIZ
    const parties = ['Grn', 'Other', 'Dem', 'GOP']

    // CALLED RACES -------------------------------------------------
    let calledHouse = enumeratedHouse
      .filter(d => d.calledRace)
      .filter(d => !d.office.includes('LA'))
    for (let i = 0; i < calledHouse.length; i++) {
      const winner = calledHouse[i].candidates.filter(d => d.winner)[0]
      const voteShare = winner.votes / calledHouse[i].voteTotal
      calledHouse[i].winner = {
        name: winner.name,
        party: parties.includes(winner.party) ? winner.party : 'Other',
        voteShare: voteShare,
        votes: winner.votes,
        index: (winner.party === 'GOP' ? 1 : -1) * voteShare
      }
    }
    calledHouse
      .sort((a,b) => a.winner.index - b.winner.index)
      .sort((a,b) => parties.indexOf(a.winner.party) - parties.indexOf(b.winner.party))
    setCalledHouse(calledHouse)
    // console.log(enumeratedHouse.map(d=> d.office))
    // console.log({enumeratedHouse, calledHouse})

    let calledSenate = enumeratedSenate
      .filter(d => d.calledRace)
      .filter(d => !d.office.includes('LA'))
    for (let i = 0; i < calledSenate.length; i++) {
      const winner = calledSenate[i].candidates.filter(d => d.winner)[0]
      const voteShare = winner.votes / calledSenate[i].voteTotal
      calledSenate[i].winner = {
        name: winner.name,
        party: parties.includes(winner.party) ? winner.party : 'Other',
        votes: winner.votes,
        voteShare: voteShare,
        index: (winner.party === 'GOP' ? 1 : -1) * voteShare
      }
    }
    calledSenate
      .sort((a,b) => a.winner.index - b.winner.index)
      .sort((a,b) => parties.indexOf(a.winner.party) - parties.indexOf(b.winner.party))
    setCalledSenate(calledSenate)
    // console.log(enumeratedSenate.map(d=> d.office))
    // console.log({enumeratedSenate, calledSenate})

    // calculate counts of called races for bars
    let calledHouseCounts = {}, calledSenateCounts = {}
    // Add an other category for everything we don't have
    parties.forEach(party => {
      const hCount = calledHouse.filter(d => d.winner.party === party).length
      calledHouseCounts[party] = hCount

      const sCount = calledSenate.filter(d => d.winner.party === party).length
      calledSenateCounts[party] = sCount
    })
    setCalledHouseCounts(calledHouseCounts)
    setCalledSenateCounts(calledSenateCounts)
    // console.log({calledHouseCounts,calledSenateCounts})

    // STILL VOTING RACES -------------------------------------------
    let votingHouseTemp = enumeratedHouse
      .filter(d => !d.calledRace || d.office.includes('LA'))
    for (let i = 0; i < votingHouseTemp.length; i++) {
      let leader = votingHouseTemp[i].candidates[0]

      for (let j = 1; j < votingHouseTemp[i].candidates.length; j++) {
        if (votingHouseTemp[i].candidates[j].votes > leader.votes) {
          leader = votingHouseTemp[i].candidates[j]
        }
      }

      const voteShare = leader.votes / votingHouseTemp[i].voteTotal
      votingHouseTemp[i].leader = {
        name: leader.name,
        party: parties.includes(leader.party) ? leader.party : 'Other',
        votes: leader.votes,
        voteShare: voteShare,
        index: (leader.party === 'GOP' ? 1 : -1) * voteShare
      }
    }
    votingHouseTemp
      .sort((a,b) => a.leader.index - b.leader.index)
      .sort((a,b) => parties.indexOf(a.leader.party) - parties.indexOf(b.leader.party))
    setVotingHouse(votingHouseTemp.filter(d => d.votePercent >= threshold))
    setSubThresholdHouse(
      votingHouseTemp
        .filter(d => d.votePercent < threshold)
        .sort((a,b) => a.votePercent - b.votePercent)
    )

    let votingSenateTemp = enumeratedSenate
      .filter(d => !d.calledRace || d.office.includes('LA'))
    for (let i = 0; i < votingSenateTemp.length; i++) {
      let leader = votingSenateTemp[i].candidates[0]

      for (let j = 1; j < votingSenateTemp[i].candidates.length; j++) {
        if (votingSenateTemp[i].candidates[j].votes > leader.votes) {
          leader = votingSenateTemp[i].candidates[j]
        }
      }

      const voteShare = leader.votes / votingSenateTemp[i].voteTotal
      votingSenateTemp[i].leader = {
        name: leader.name,
        party: parties.includes(leader.party) ? leader.party : 'Other',
        votes: leader.votes,
        voteShare: voteShare,
        index: (leader.party === 'GOP' ? 1 : -1) * voteShare
      }
    }
    votingSenateTemp
      .sort((a,b) => a.leader.index - b.leader.index)
      .sort((a,b) => parties.indexOf(a.leader.party) - parties.indexOf(b.leader.party))
    setVotingSenate(votingSenateTemp.filter(d => d.votePercent >= threshold))
    setSubThresholdSenate(
      votingSenateTemp
        .filter(d => d.votePercent < threshold)
        .sort((a,b) => a.votePercent - b.votePercent)
    )
    // console.log({votingHouse, votingSenate, subThresholdHouse, subThresholdSenate})


    // calculate counts of called races for bars
    let vHCounts = {}, vSCounts = {}
    // Add an other category for everything we don't have
    parties.forEach(party => {
      const hCount = votingHouseTemp
        .filter(d => d.votePercent >= threshold)
        .filter(d => d.leader.party === party)
        .length
      vHCounts[party] = hCount

      const sCount = votingSenateTemp
        .filter(d => d.votePercent >= threshold)
        .filter(d => d.leader.party === party)
        .length
      vSCounts[party] = sCount
    })
    // Add key-value pair for seats with less than 35% votes
    vHCounts['x'] = votingHouseTemp
        .filter(d => d.votePercent < threshold)
        .length
    vSCounts['x'] = votingSenateTemp
        .filter(d => d.votePercent < threshold)
        .length
    setVotingHouseCounts(vHCounts)
    setVotingSenateCounts(vSCounts)
    // console.log({vHCounts,vSCounts})

  }, [dataStatic, dataDynamic])

  return <div className='legislature-wrapper'>
    {!noSeats &&
      <LegislatureLegend />
    }
    <div className='container-2col'>
      <div className='chart-container'>
        <label className={ChartStyles.title}>
          U.S. Senate
        </label>
        <LegislatureBar
          type='senate'
          baseSeats={baseSenateCounts}
          calledSeats={calledSenateCounts}
          votingSeats={votingSenateCounts}
        />
        {!noSeats &&
          <LegislatureChart
            type='senate'
            baseSeats={baseSenateCounts}
            calledSeats={calledSenate}
            votingSeats={votingSenate}
            subThresholdSeats={subThresholdSenate}
            showTooltip={showTooltip}
          />
        }
      </div>
      <div className='chart-container'>
        <label className={ChartStyles.title}>
          U.S. House
        </label>
        <LegislatureBar
          type='house'
          baseSeats={baseHouseCounts}
          calledSeats={calledHouseCounts}
          votingSeats={votingHouseCounts}
        />
        {!noSeats &&
          <LegislatureChart
            type='house'
            baseSeats={baseHouseCounts}
            calledSeats={calledHouse}
            votingSeats={votingHouse}
            subThresholdSeats={subThresholdHouse}
            showTooltip={showTooltip}
          />
        }
      </div>
    </div>
    {!noSeats &&
      <div className={ChartStyles.source + ' legislature-footnote'}>
        Note: Senate counts for Democrats include two Independents who caucus with Democrats.
        Party affiliations for leading candidates are only shown when at least {threshold}% of the expected votes are received for a given seat. Louisiana has open primaries on Election Day, so final election results are not available until December.
      </div>
    }
  </div>

}

export default CongressChartWrapper 