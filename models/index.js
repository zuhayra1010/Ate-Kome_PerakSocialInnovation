// Keyed by collection name - lib/db.js looks models up by these keys.
import User from './User';
import Event from './Event';
import Sponsor from './Sponsor';
import Sponsorship from './Sponsorship';
import Gig from './Gig';
import Carpool from './Carpool';
import PointTx from './PointTx';
import Badge from './Badge';
import Reward from './Reward';
import Redemption from './Redemption';
import Rating from './Rating';
import Application from './Application';

export const models = {
  users: User,
  events: Event,
  sponsors: Sponsor,
  sponsorships: Sponsorship,
  gigs: Gig,
  carpools: Carpool,
  pointtxs: PointTx,
  badges: Badge,
  rewards: Reward,
  redemptions: Redemption,
  ratings: Rating,
  applications: Application,
};

export const COLLECTIONS = Object.keys(models);
