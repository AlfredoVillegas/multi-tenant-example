import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};



export default async function middleware2(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  //   console.log(hostname)
  console.log("hostname: ", hostname);
 

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for app pages
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    console.log("redirecting to app");
    const session = true;
    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url),
    );
  }

  // special case for `vercel.pub` domain
  if (hostname === "vercel.pub") {
    return NextResponse.redirect(
      "https://vercel.com/blog/platforms-starter-kit",
    );
  }

  // rewrite root application to `/home` folder
  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    console.log("redirecting to home");

    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}


export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  console.log('env ppublic root domain: ', process.env.NEXT_PUBLIC_ROOT_DOMAIN);
  console.log('host original: ', req.headers.get('host'));
  let hostname = req.headers.get('host')?.replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
  console.log('hostname remplazadoo: ', hostname);
  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
  console.log('path: ', path);
  console.log('request.url: ', req.url);
  // rewrites for app pages
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    console.log('request.url: ', req.url);
    const accessToken = { value: '' } //cookies().get('accessToken');
    console.log('accessToken: ', accessToken?.value);
    if (!accessToken?.value && path.startsWith('/dashboard')) {
      console.log('redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    } else if (accessToken?.value && path == '/login') {
      console.log('entro en la 2 condicion');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    console.log('redirecting to app ');
    return NextResponse.rewrite(new URL(`/app${path === '/' ? '' : path}`, req.url));
  }

 
  // rewrite root application to `/home` folder
  if (hostname === 'localhost:3000' || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    console.log('redirecting to home / ');
    console.log('request.url: ', req.url);
    return NextResponse.rewrite(new URL(`/${path === '/' ? '' : path}`, req.url));
  }

  // rewrite everything else to `/[domain] dynamic route
  console.log('redirecting to subdomain');
  console.log('request.url: ', req.url);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}