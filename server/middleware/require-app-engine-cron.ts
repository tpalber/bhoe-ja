/**
 * Express middleware allowing only App Engine Cron Service requests through.
 *
 * Google's frontend strips the X-Appengine-Cron header from external
 * traffic, so its presence proves the request came from the Cron Service.
 * The check is skipped off App Engine (GAE_ENV is only set in the
 * standard environment) so local development can still trigger scrapes
 * manually.
 */
export function requireAppEngineCron(req: any, res: any, next: any): void {
  if (!process.env.GAE_ENV) {
    next();
    return;
  }
  if (req.get('X-Appengine-Cron') === 'true') {
    next();
    return;
  }
  res.status(403).json({ message: 'Forbidden: cron requests only.' });
}
