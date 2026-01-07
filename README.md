# weight-and-balance

General Weight and Balance calculation library usable for gliders. Since this is based on simple
arm calculations, it likely can work with anything with a 2 point (or 3 if using tricycle undercarriage)
ground touching points. 

![npm type definitions](https://img.shields.io/npm/types/@cael-aero/casa-utils)
![node](https://img.shields.io/node/v/@cael-aero/weight-and-balance)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
![GitHub package.json version](https://img.shields.io/github/package-json/v/CAELAero/weight-and-balance)
[![Build Status](https://travis-ci.com/CAELAero/weight-and-balance.svg?branch=master)](https://travis-ci.com/CAELAero/weight-and-balance)
[![Coverage Status](https://coveralls.io/repos/github/CAELAero/weight-and-balance/badge.svg)](https://coveralls.io/github/CAELAero/weight-and-balance)

## Documentation

The library has been built in accordance with the Gliding Federation of Australia's Airworthiness manuals -
specifically the Manual of Standard Procedures - Part 3, and the Weight and Balance reference guide (Rev 1.2).

* Repository https://github.com/CAELAero/weight-and-balance
* API Documentation: https://caelaero.github.io/weight-and-balance/
* AIRW-M01 MOSP Part 3 v9.2 https://doc.glidingaustralia.org/index.php?option=com_docman&view=document&layout=default&alias=2130-mosp-3-procedures-v7-3-2016-12-19-unmarked-airw-m01&category_slug=mosp-part-3-airworthiness&Itemid=101 
* AIRW-D011 Weight and Balance of Sailplanes Rev 1.2 https://doc.glidingaustralia.org/index.php?option=com_docman&view=document&layout=default&alias=3313-airw-d011-weight-and-balance-of-sailplanes-v1-1-23052023&category_slug=weight-and-balance-of-sailplanes-1&Itemid=101 

 
## Installation

```sh
npm install @cael-aero/weight-and-balance --save
yarn add @cael-aero/weight-and-balance
bower install @cael-aero/weight-and-balance --save
```                                      

## Usage

### Javascript 

```javascript
var casaUtils = require('@cael-aero/weight-and-balance');

var config = { .... };
var datum = { .... };
var measurements = { ... };

var output = calculateWeightAndBalance(datum, config, measurements);
```

### TypeScript
```typescript
import { calculateWeightAndBalance } from '@cael-aero/weight-and-balance';

const config: AircraftConfiguration = { .... };
const datum: WeightAndBalanceDatum = { .... };
const measurements: WeightAndBalanceMeasurement = { ... };

const output = calculateWeightAndBalance(datum, config, measurements);
```


### Measurement Units

The calculation library is unitless and does not care what numbers you put in. By convention, and using
TCDS data, it is almost always in metric units - kilograms for weight, millimetres for distances. 
Anything representing water ballast amounts are still in kilograms, though thanks to metric units,
litres and kilograms are interchangable. All the examples provided here use metric numbers.

## API Examples

### Calculate a new W&B outcome from a set of measurements

This is the typical scenario after repair work. Weights have changed, 
requiring a full reweigh of the aircraft. 

```typescript
import { 
    calculateWeightAndBalance,
    AircraftConfiguration, 
    WeightAndBalanceDatum, 
    WeightAndBalanceComponentChange
} from '@cael-aero/weight-and-balance';

const config: AircraftConfiguration = { .... };
const datum: WeightAndBalanceDatum = { .... };
const measurements: WeightAndBalanceMeasurement = {
    undercarriage1Weight: 246,
    undercarriage2Weight: 33,
    wing1Weight: 72,
    wing2Weight: 74,
};

const output = calculateWeightAndBalance(datum, config, measurements);
```

### Update the weight and balance after component change

Typical of a maintenance update where an instrument is changed or heavier tailwheel has been added. 
A single item has changed on the aircraft and you have measured the arm 
for it. 

```typescript
import { 
    updateWeightAndBalance. 
    AircraftConfiguration, 
    WeightAndBalanceDatum, 
    WeightAndBalanceComponentChange
} from '@cael-aero/weight-and-balance';

const config: AircraftConfiguration = { .... };
const datum: WeightAndBalanceDatum = { .... };
const change: WeightAndBalanceComponentChange = {
    aircraftWeight: 279,
    aircraftArm: 551,
    nonLiftingPartsWeight: 133,
    itemArm: datum.distanceFrontWheelToRearWheel + datum.distanceFrontWheelToDatum,
    itemWeightChange: -3.0,
    weightChangeInFuselage: true
};

const output = updateWeightAndBalance(datum, config, change);
```

Note the use of the ```weightChangeInFuselage``` flag here. This is essential
to know as it determines whether the weight change impacts the Non-lifting parts
weight of the aircraft (ie total fuselage load).

### Recalculate a previous entry

This is used when you're trying to reverse engineer a previous W&B calculation
and all you have is the logbook entry. That typically just has the aircraft
empty arm and CG location. From this you can regenerate all the placard data.
The other two calculation requests call this internally after determining the 
new CG location and empty weight.  It is basically a simplified version of
the previous example - just leave the itemX properties undefined.

```typescript
import { 
    generateWeightAndBalancePlacardData. 
    AircraftConfiguration, 
    WeightAndBalanceDatum, 
    WeightAndBalanceComponentChange
} from '@cael-aero/weight-and-balance';

const config: AircraftConfiguration = { .... };
const datum: WeightAndBalanceDatum = { .... };
const change: WeightAndBalanceComponentChange = {
    aircraftWeight: 279,
    aircraftArm: 551,
    nonLiftingPartsWeight: 133,
};

const output = generateWeightAndBalancePlacardData(datum, config, change);
```

### Calculation Options

All forms of the above methods can take an options object, that guides the
output generation. It has the following properties

| Property Name | Default | Description |
| ---- | ---- | ---- |
| useGFAMinBuffer | false | If true, apply a 5% buffer to the aft CG location |
| calculatePrimary | true | Calculate for the primary (true) or alternate (false) wingspan. Note some aircraft will have different max all up weight limits depending on the wingspan chosen, so this will adjust the output accordingly |
| minAllowedWeightDifference | 10 | Stop the calculation when the difference between the minimum and maximum pilot weights becomes less than this value |
| placardWeightIncremments | 10 | The weight increment for each line when generating the placard data |
| p1ArmRangePercentage | undefined | Some aircraft can have a min and max Pilot 1 arm specified. If that is true in the datum information, and this value is defined, it is treated as a percentage of the difference between the two arms to use as a "average" P1 arm. If undefined, and a min/max is provided in the datum, then the conservative approach is to use the shortest arm with the minimum pilot weight, and the longest arm with the maximum pilot weight | 

If you're running a club two-seater, then you would run the code like this:

```typescript
import { 
    generateWeightAndBalancePlacardData. 
    AircraftConfiguration, 
    WeightAndBalanceDatum, 
    WeightAndBalanceComponentChange
} from '@cael-aero/weight-and-balance';

const config: AircraftConfiguration = { .... };
const datum: WeightAndBalanceDatum = { .... };
const change: WeightAndBalanceComponentChange = {
    aircraftWeight: 279,
    aircraftArm: 551,
    nonLiftingPartsWeight: 133,
};

const output = generateWeightAndBalancePlacardData(datum, config, change, { useGFAMinBuffer: true });
```

## Detailed Data Description

### Introduction

The library consists of 3 main utility functions, and a large collection of interface/type definitions for
Typescript. There is minimal use of OO typing, allowing for reasonable strict Javascript usage too. There's
no runtime dependencies, but naturally a bunch of dev-time dependencies to compile, build and test the
library. 

To use the library, you need 2 pieces of reference data, and the measurements. This library does not
provide the reference data, but we also track a standard list separately that can be used as input. Some
example reference data can be seen from the unit tests that accompany this library. 

### Aircraft Datum 

The datum provides reference measurement information about the aircraft - the location of the reference
point (almost always the Wing Root Leading Edge - WRLE), how to level the aircraft before measuring, 
and then 3 sets of data: distances (otherwise known as arms), limits around weights, and then some
other measurements about aircraft dimensions. Mandatory items are needed for the core calculations.
Optional values are used for the aircraft that have those configurations available. For example some
aircraft have tail ballast tanks for pilot CG and wing ballast CG measurement. Arms for each of these
are needed. 

Datum information is common to a type - it should not change per individual aircraft within
that type. Most of the datum information will be sourced from its Type Certificate Data Sheet (TCDS).
However, optional information will be often difficult to come by - pilot arms are often found in
repair or maintenance manuals, tail and cockpit ballast arms are often missing completely and general
internet data is used from another's calculation. 


A typical declaration might look like this (using a SZD48-1 as an example):

```typescript
    const datum: WeightAndBalanceDatum = {
        location: "WRLE",
        levellingInstructions: "Trailing edge of wing root 22mm below datum",
        calculationModel: DatumCalculationModel.MODEL_1,
        maxAllUpWeight: 535,
        maxDryWeight: 385,
        maxNonLiftingPartsWeight: 245,
        maxSeatWeight: 110,
        minAllowedPilotWeight: 70,
        forwardCGLimit: 158,
        aftCGLimit: 336,
        pilot1Arm: -616,
        distanceFrontWheelToDatum: 120,
        distanceFrontWheelToRearWheel: 3648
    };

```

### Aircraft Configuration

The aircraft configuration provides general information about how the aircraft is built. A general
model is supplied here and contains far more information than what is needed for a weight and balance
calculation. Like the Datum, it is general per type of aircraft, though as an input here you can
customise the data according to the specific aircraft being calculated. For example, a DG300 could
be ordered with or without winglets, a tail tank was optional etc. A lot of early generation glass
gliders were delivered with the ability to take water ballast, but have developed leaks in the tanks
and are no longer capable of running ballast. A simple example, again for the SZD48-1 looks like
this:

```typescript
    const config: AircraftConfiguration = {
        hasFlaps: false,
        hasElevatorTrim: false,
        hasRudderVators: false,
        hasFixedUndercarriage: false,
        undercarriageType: UndercarriageConfiguration.INLINE,
        seatingType: SeatingConfiguration.SINGLE,
        wingSpanPrimary: 15,
        wingPanelCount: 2,
        hasWingletOption: false,
        wingMaxBallastAmount: 150,
        cockpitBallastBlockCount: 0,
        tailCGAdjustBallastType: TailBallastType.NONE,
        tailCGAdjustBallastCapacity: null
    };
```

Most modern aircraft have two different wing length options available, and so to save on double
declaration of data, both options can be supplied in a single object instance and then the 
calculation options are used to select which of the two can be used. To supply both wingspans,
use the ```wingspanAlternate``` property eg:

```typescript
    const config: AircraftConfiguration = {
        ....
        wingSpanPrimary: 15,
        wingSpanAlternate: 18,
        wingPanelCount: 4,
    };

```

Note the use of the wingPanelCount field here. This represents that there's inner and outer panels
for the wings. However, the W&B calculator does not require the use of 4 individual wing measured 
weights, and is fine just operating with a combined weight for left and right wings. This option
may be useful for UIs that collect data from an end user.

Finally, tail ballast is a complex thing. There's multiple ways it could be provided. The most
complex example would be the DG1000 that has water tank for balancing the wing ballast tanks,
but then blocks for pilot CG management. To make it even more tricky, there's different sizes 
of blocks. However, a glider like the LS10 has 2 separate water tanks - one each for wing ballast
and pilot CG adjustment. The calculator treats the wing ballast adjustment separately from the CG adjustment with individual fields.  Using the DG1000 as an example, here's configuration of
the tail ballast arrangements:

```typescript
    const config: AircraftConfiguration = {
        .... 
        seatingType: SeatingConfiguration.TANDEM,
        wingSpanPrimary: 18,
        wingSpanAlternate: 20,
        wingPanelCount: 4,
        wingMaxBallastAmount: 160,
        tailWingBallastCompensationAmount: 5.5,
        tailCGAdjustBallastType: TailBallastType.BLOCKS,
        tailCGAdjustBallastCapacity: [
            { label: "Large", weightPerBlock: 2.4, maxBlockCount: 4 }, 
            { label: "Small", weightPerBlock: 1.2, maxBlockCount: 2 }
        ]
    };

```


## License

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree. 

## Related Projects

Datum and aircraft config data: https://github.com/CAELAero/aircraft-data
