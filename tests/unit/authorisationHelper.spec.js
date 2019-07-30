/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const { builtErrorCodes } = require('../../src/errorHandler');
const { setup, hasRole, authorise } = require('../../src/authorisationHelper');
const { assertValidationErrorObj } = require('../../src/testHelper');

const testUsers = {
    INTERNAL_SERVICE_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJpYXQiOjE1NTk2OTY0NjQsImV4cCI6ODY0MDAwMDE1NTk2OTY0NjB9.DYDKSniyo-pxs3Zr7fPlLs46LeYFAIFM3fYVThXDhBg',
    PORTAL_ADMIN_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWxBZGRyZXNzIjoic2FyYXZnb3ZpbmRhcmFtYW5AYnVpbHQuY29tLmF1IiwiZmlyc3ROYW1lIjoiU2FyYXYiLCJsYXN0TmFtZSI6IkdvdmluIiwiZnVsbE5hbWUiOiJTYXJhdiBHb3ZpbiIsInByZWZlcnJlZE5hbWUiOm51bGwsIm1vYmlsZU51bWJlciI6bnVsbCwiZW1haWxWZXJpZmllZE9uIjoiMjAxOS0wNS0yNyIsImlkIjoiNWFiMGY5MjQtNTY1Ny00OTczLTlmMzItZWFlOTUxMmZhYWMwIiwicmVnaXN0cnkiOnsiaWQiOiJ1c2VyLnVzLmQuMTQiLCJmaXJzdE5hbWUiOiJTYXJhdiIsImxhc3ROYW1lIjoiR292aW5kYXJhbWFuIiwicHJlZmVycmVkTmFtZSI6bnVsbCwiZGlzcGxheU5hbWUiOiJTYXJhdiBHb3ZpbmRhcmFtYW4iLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJzYXJhdmdvdmluZGFyYW1hbkBidWlsdC5jb20uYXUiLCJhcHBsaWNhdGlvbnMiOlt7ImlkIjoiYXBwbGljYXRpb24udXMuZC4xIiwibmFtZSI6IkZvcmVjYXN0aW5nIiwibWV0YWRhdGEiOnsic2hvcnROYW1lIjoiZmMifSwiY3JlYXRlZEF0IjoiMjAxOC0xMC0yM1QyMjo1MjowNy43ODZaIiwidXBkYXRlZEF0IjoiMjAxOC0xMC0yM1QwMDowMDowMC4wMDBaIiwiZGJpZCI6MX0seyJpZCI6ImFwcGxpY2F0aW9uLnVzLmQuMiIsIm5hbWUiOiJCdWlsdCBXb3JrZmxvdyIsIm1ldGFkYXRhIjp7fSwiY3JlYXRlZEF0IjoiMjAxOS0wMS0xNlQwMDoyODozMi4yMzZaIiwidXBkYXRlZEF0IjoiMjAxOS0wMS0xNlQwMDowMDowMC4wMDBaIiwiZGJpZCI6Mn0seyJpZCI6ImFwcGxpY2F0aW9uLnVzLmQuNCIsIm5hbWUiOiJDb25zdHJ1Y3Rpb24gVGltZXNoZWV0cyIsIm1ldGFkYXRhIjp7InNob3J0TmFtZSI6ImN3In0sImNyZWF0ZWRBdCI6IjIwMTktMDEtMjlUMTU6NDg6MzAuMzQ1WiIsInVwZGF0ZWRBdCI6IjIwMTktMDEtMjlUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjR9LHsiaWQiOiJhcHBsaWNhdGlvbi51cy5kLjUiLCJuYW1lIjoiU1dNUyIsIm1ldGFkYXRhIjp7fSwiY3JlYXRlZEF0IjoiMjAxOS0wNC0xNFQxOTo0MDo1NC43NjBaIiwidXBkYXRlZEF0IjoiMjAxOS0wNC0xNFQwMDowMDowMC4wMDBaIiwiZGJpZCI6NX1dLCJyb2xlcyI6W3siaWQiOiJyb2xlLnVzLmQuMSIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjEiLCJuYW1lIjoiU3VwZXIiLCJwZXJtaXNzaW9uIjoyNTUsImVudGl0eSI6bnVsbCwiZW50aXR5SWQiOm51bGwsImNyZWF0ZWRBdCI6IjIwMTgtMTAtMjNUMjI6NTI6MzcuMzg0WiIsInVwZGF0ZWRBdCI6IjIwMTgtMTAtMjNUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjF9LHsiaWQiOiJyb2xlLnVzLmQuMiIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjEiLCJuYW1lIjoiQnVzaW5lc3MgVW5pdCBBZG1pbiIsInBlcm1pc3Npb24iOjE0LCJlbnRpdHkiOiJidXNpbmVzc1VuaXQiLCJlbnRpdHlJZCI6ImJ1c2luZXNzdW5pdC5jZC5kLjIiLCJjcmVhdGVkQXQiOiIyMDE4LTEwLTIzVDIyOjUzOjQ1Ljk5NVoiLCJ1cGRhdGVkQXQiOiIyMDE4LTEwLTIzVDAwOjAwOjAwLjAwMFoiLCJkYmlkIjoyfSx7ImlkIjoicm9sZS51cy5kLjQiLCJhcHBsaWNhdGlvbklkIjoiYXBwbGljYXRpb24udXMuZC4xIiwibmFtZSI6IlByb2plY3QgRWRpdG9yIiwicGVybWlzc2lvbiI6NiwiZW50aXR5IjoicHJvamVjdCIsImVudGl0eUlkIjoicHJvamVjdC5jZC5kLjU1OSIsImNyZWF0ZWRBdCI6IjIwMTgtMTAtMjNUMjI6NTM6NDUuOTk1WiIsInVwZGF0ZWRBdCI6IjIwMTgtMTAtMjNUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjR9LHsiaWQiOiJyb2xlLnVzLmQuNSIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjEiLCJuYW1lIjoiUHJvamVjdCBWaWV3ZXIiLCJwZXJtaXNzaW9uIjoyLCJlbnRpdHkiOiJwcm9qZWN0IiwiZW50aXR5SWQiOiJwcm9qZWN0LmNkLmQuNTU5IiwiY3JlYXRlZEF0IjoiMjAxOC0xMC0yM1QyMjo1Mzo0NS45OTVaIiwidXBkYXRlZEF0IjoiMjAxOC0xMC0yM1QwMDowMDowMC4wMDBaIiwiZGJpZCI6NX0seyJpZCI6InJvbGUudXMuZC42IiwiYXBwbGljYXRpb25JZCI6ImFwcGxpY2F0aW9uLnVzLmQuMiIsIm5hbWUiOiJQb3J0YWwgQWRtaW4iLCJwZXJtaXNzaW9uIjoyNTUsImVudGl0eSI6bnVsbCwiZW50aXR5SWQiOm51bGwsImNyZWF0ZWRBdCI6IjIwMTktMDEtMTZUMDI6MDA6MDMuNTYyWiIsInVwZGF0ZWRBdCI6IjIwMTktMDEtMTZUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjZ9LHsiaWQiOiJyb2xlLnVzLmQuNyIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjIiLCJuYW1lIjoiQ2xpZW50IEFkbWluIiwicGVybWlzc2lvbiI6MTQsImVudGl0eSI6ImNsaWVudCIsImVudGl0eUlkIjoiZjExMTVlNDYtOGY0OS00MDUwLWE5NTMtNWU0NTI3NTU1YWU1IiwiY3JlYXRlZEF0IjoiMjAxOS0wMS0xNlQwMjowMjowOS41MjlaIiwidXBkYXRlZEF0IjoiMjAxOS0wMS0xNlQwMDowMDowMC4wMDBaIiwiZGJpZCI6N30seyJpZCI6InJvbGUudXMuZC4xMSIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjUiLCJuYW1lIjoiUG9ydGFsIEFkbWluIiwicGVybWlzc2lvbiI6MjU1LCJlbnRpdHkiOm51bGwsImVudGl0eUlkIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE5LTA0LTE0VDIwOjIwOjEyLjU2MVoiLCJ1cGRhdGVkQXQiOiIyMDE5LTA0LTE0VDAwOjAwOjAwLjAwMFoiLCJkYmlkIjoxMX1dLCJtZXRhZGF0YSI6e30sImNyZWF0ZWRBdCI6IjIwMTktMDEtMTZUMDM6NDI6NDcuNDQ5WiIsInVwZGF0ZWRBdCI6IjIwMTktMDEtMTZUMDA6MDA6MDAuMDAwWiIsImRlbGV0ZWRBdCI6bnVsbCwiZGJpZCI6MTR9LCJpYXQiOjE1NTk2MTE1OTV9.dFGJQzhyplTwAera-XtfIF2WSyevElRPNJa06U-6J1M',
    ORG_ADMIN_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWxBZGRyZXNzIjoic2FyYS52YW5hbi5nb3ZpbmRhcmFtYW5AZ21haWwuY29tIiwiZmlyc3ROYW1lIjoiU2FyYXYiLCJsYXN0TmFtZSI6IkdvdmluIiwiZnVsbE5hbWUiOiJTYXJhdiBHb3ZpbiIsInByZWZlcnJlZE5hbWUiOm51bGwsIm1vYmlsZU51bWJlciI6bnVsbCwiZW1haWxWZXJpZmllZE9uIjoiMjAxOS0wNi0wMyIsImlkIjoiZTRmNzY4ZTEtMGY2Yi00YTE0LThkN2YtMmFjYzIwZWUwYjMzIiwicmVnaXN0cnkiOnsiaWQiOiJ1c2VyLnVzLmQuMTAzNyIsImZpcnN0TmFtZSI6IlNhcmF2IiwibGFzdE5hbWUiOiJUZXN0IiwicHJlZmVycmVkTmFtZSI6bnVsbCwiZGlzcGxheU5hbWUiOiJTYXJhdiBUZXN0MiIsInBob25lIjpudWxsLCJlbWFpbCI6InNhcmEudmFuYW4uZ292aW5kYXJhbWFuQGdtYWlsLmNvbSIsImFwcGxpY2F0aW9ucyI6W3siaWQiOiJhcHBsaWNhdGlvbi51cy5kLjIiLCJuYW1lIjoiQnVpbHQgV29ya2Zsb3ciLCJtZXRhZGF0YSI6e30sImNyZWF0ZWRBdCI6IjIwMTktMDEtMTZUMDA6Mjg6MzIuMjM2WiIsInVwZGF0ZWRBdCI6IjIwMTktMDEtMTZUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjJ9LHsiaWQiOiJhcHBsaWNhdGlvbi51cy5kLjUiLCJuYW1lIjoiU1dNUyIsIm1ldGFkYXRhIjp7fSwiY3JlYXRlZEF0IjoiMjAxOS0wNC0xNFQxOTo0MDo1NC43NjBaIiwidXBkYXRlZEF0IjoiMjAxOS0wNC0xNFQwMDowMDowMC4wMDBaIiwiZGJpZCI6NX1dLCJyb2xlcyI6W3siaWQiOiJyb2xlLnVzLmQuMTAiLCJhcHBsaWNhdGlvbklkIjoiYXBwbGljYXRpb24udXMuZC4yIiwibmFtZSI6IkNsaWVudCBWaWV3ZXIiLCJwZXJtaXNzaW9uIjoyLCJlbnRpdHkiOiJjbGllbnQiLCJlbnRpdHlJZCI6ImYxMTE1ZTQ2LThmNDktNDA1MC1hOTUzLTVlNDUyNzU1NWFlNSIsImNyZWF0ZWRBdCI6IjIwMTktMDQtMDJUMjI6MDY6MzkuMTA5WiIsInVwZGF0ZWRBdCI6IjIwMTktMDQtMDJUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjEwfSx7ImlkIjoicm9sZS51cy5kLjEyIiwiYXBwbGljYXRpb25JZCI6ImFwcGxpY2F0aW9uLnVzLmQuNSIsIm5hbWUiOiJPcmcgQWRtaW4iLCJwZXJtaXNzaW9uIjoxNCwiZW50aXR5Ijoib3JnYW5pc2F0aW9uIiwiZW50aXR5SWQiOiI0ODNlMGEzOS05Zjk1LTQyMjctYThkZC04YWNhZDA5ZmZiMjYiLCJjcmVhdGVkQXQiOiIyMDE5LTA1LTMwVDA0OjQwOjUxLjQwMFoiLCJ1cGRhdGVkQXQiOiIyMDE5LTA1LTMwVDAwOjAwOjAwLjAwMFoiLCJkYmlkIjoxMn1dLCJtZXRhZGF0YSI6e30sImNyZWF0ZWRBdCI6IjIwMTktMDUtMjZUMDc6NDc6MjMuNDEzWiIsInVwZGF0ZWRBdCI6IjIwMTktMDUtMjZUMDA6MDA6MDAuMDAwWiIsImRlbGV0ZWRBdCI6bnVsbCwiZGJpZCI6MTAzN30sImlhdCI6MTU1OTYwMDc1OX0.KBdEdpHUfiytAehtHmdHoFDGfuHVRqtk5Dsl3zr8SWA',
    PCBU_USER_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWxBZGRyZXNzIjoic2FyYXZhbmFuLmdvdmluZGFyYW1hbkBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJTYXJhdiIsImxhc3ROYW1lIjoiR292aW4iLCJmdWxsTmFtZSI6IlNhcmF2IEdvdmluIiwicHJlZmVycmVkTmFtZSI6bnVsbCwibW9iaWxlTnVtYmVyIjpudWxsLCJlbWFpbFZlcmlmaWVkT24iOm51bGwsImlkIjoiNzQ4ZTdiZGUtZGYxMS00ZGIwLTg5OTktMjU2YmE0YzlkNGY2IiwicmVnaXN0cnkiOnsiaWQiOiJ1c2VyLnVzLmQuMTAzOCIsImZpcnN0TmFtZSI6bnVsbCwibGFzdE5hbWUiOm51bGwsInByZWZlcnJlZE5hbWUiOm51bGwsImRpc3BsYXlOYW1lIjpudWxsLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJzYXJhdmFuYW4uZ292aW5kYXJhbWFuQGdtYWlsLmNvbSIsImFwcGxpY2F0aW9ucyI6W3siaWQiOiJhcHBsaWNhdGlvbi51cy5kLjUiLCJuYW1lIjoiU1dNUyIsIm1ldGFkYXRhIjp7fSwiY3JlYXRlZEF0IjoiMjAxOS0wNC0xNFQxOTo0MDo1NC43NjBaIiwidXBkYXRlZEF0IjoiMjAxOS0wNC0xNFQwMDowMDowMC4wMDBaIiwiZGJpZCI6NX1dLCJyb2xlcyI6W3siaWQiOiJyb2xlLnVzLmQuMTMiLCJhcHBsaWNhdGlvbklkIjoiYXBwbGljYXRpb24udXMuZC41IiwibmFtZSI6IlBDQlUgVXNlciIsInBlcm1pc3Npb24iOjYsImVudGl0eSI6InByb2plY3QiLCJlbnRpdHlJZCI6ImJjM2MxMjcxLWE1NjEtNDRiMi1iMTU1LWI5ODkzMmRhYjhjZSIsImNyZWF0ZWRBdCI6IjIwMTktMDUtMzBUMDQ6NDE6MTcuMDIzWiIsInVwZGF0ZWRBdCI6IjIwMTktMDUtMzBUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjEzfV0sIm1ldGFkYXRhIjp7fSwiY3JlYXRlZEF0IjoiMjAxOS0wNS0zMFQwNDo0ODoxNy40MjRaIiwidXBkYXRlZEF0IjoiMjAxOS0wNS0zMFQwMDowMDowMC4wMDBaIiwiZGVsZXRlZEF0IjpudWxsLCJkYmlkIjoxMDM4fSwiaWF0IjoxNTU5NjAwNTM4fQ.WxZ8sz1svUCEsGfj9pdT4rxokCLv53bpJNONrXzVaZE',
    SMWS_USER_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWxBZGRyZXNzIjoicy5hcmF2YW5hbi5nb3ZpbmRhcmFtYW5AZ21haWwuY29tIiwiZmlyc3ROYW1lIjoiU2FyYXYiLCJsYXN0TmFtZSI6IkdvdmluIiwiZnVsbE5hbWUiOiJTYXJhdiBHb3ZpbiIsInByZWZlcnJlZE5hbWUiOm51bGwsIm1vYmlsZU51bWJlciI6bnVsbCwiZW1haWxWZXJpZmllZE9uIjoiMjAxOS0wNi0wMyIsImlkIjoiNTUzNTdlNzAtZTYzZS00NTlkLTk2OTItNGZjOGE2MGE1NTFmIiwicmVnaXN0cnkiOnsiaWQiOiJ1c2VyLnVzLmQuOTU3IiwiZmlyc3ROYW1lIjoiU2FyYXYiLCJsYXN0TmFtZSI6IlRoaXJkUGFydHkiLCJwcmVmZXJyZWROYW1lIjpudWxsLCJkaXNwbGF5TmFtZSI6IlNhcmF2IFRoaXJkUGFydHkiLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJzLmFyYXZhbmFuLmdvdmluZGFyYW1hbkBnbWFpbC5jb20iLCJhcHBsaWNhdGlvbnMiOlt7ImlkIjoiYXBwbGljYXRpb24udXMuZC4yIiwibmFtZSI6IkJ1aWx0IFdvcmtmbG93IiwibWV0YWRhdGEiOnt9LCJjcmVhdGVkQXQiOiIyMDE5LTAxLTE2VDAwOjI4OjMyLjIzNloiLCJ1cGRhdGVkQXQiOiIyMDE5LTAxLTE2VDAwOjAwOjAwLjAwMFoiLCJkYmlkIjoyfSx7ImlkIjoiYXBwbGljYXRpb24udXMuZC41IiwibmFtZSI6IlNXTVMiLCJtZXRhZGF0YSI6e30sImNyZWF0ZWRBdCI6IjIwMTktMDQtMTRUMTk6NDA6NTQuNzYwWiIsInVwZGF0ZWRBdCI6IjIwMTktMDQtMTRUMDA6MDA6MDAuMDAwWiIsImRiaWQiOjV9XSwicm9sZXMiOlt7ImlkIjoicm9sZS51cy5kLjEwIiwiYXBwbGljYXRpb25JZCI6ImFwcGxpY2F0aW9uLnVzLmQuMiIsIm5hbWUiOiJDbGllbnQgVmlld2VyIiwicGVybWlzc2lvbiI6MiwiZW50aXR5IjoiY2xpZW50IiwiZW50aXR5SWQiOiJmMTExNWU0Ni04ZjQ5LTQwNTAtYTk1My01ZTQ1Mjc1NTVhZTUiLCJjcmVhdGVkQXQiOiIyMDE5LTA0LTAyVDIyOjA2OjM5LjEwOVoiLCJ1cGRhdGVkQXQiOiIyMDE5LTA0LTAyVDAwOjAwOjAwLjAwMFoiLCJkYmlkIjoxMH0seyJpZCI6InJvbGUudXMuZC4xNCIsImFwcGxpY2F0aW9uSWQiOiJhcHBsaWNhdGlvbi51cy5kLjUiLCJuYW1lIjoiU1dNUyBVc2VyIiwicGVybWlzc2lvbiI6MiwiZW50aXR5Ijoic3dtcyIsImVudGl0eUlkIjoiNzkyNzNmMTgtZjcwNC00NjZkLWFmZGItM2NmZWU1MWMwY2YxIiwiY3JlYXRlZEF0IjoiMjAxOS0wNS0zMFQwNDo0MjozMS4zNDJaIiwidXBkYXRlZEF0IjoiMjAxOS0wNS0zMFQwMDowMDowMC4wMDBaIiwiZGJpZCI6MTR9XSwibWV0YWRhdGEiOnt9LCJjcmVhdGVkQXQiOiIyMDE5LTA0LTEwVDAwOjM5OjIyLjg5NFoiLCJ1cGRhdGVkQXQiOiIyMDE5LTA0LTEwVDAwOjAwOjAwLjAwMFoiLCJkZWxldGVkQXQiOm51bGwsImRiaWQiOjk1N30sImlhdCI6MTU1OTYwMjEwM30.PjGt9Ev2flUHk6-B0Cb_k36bf4b1bMFIEYKfgOVptlg',
};

const roles = {
    internalService: 'internalService',
    portalAdmin: 'portalAdmin',
    orgAdmin: 'orgAdmin',
};

const roleData = [
    {
        name: roles.internalService,
        entity: null,
        entityId: null,
    },
    {
        name: roles.portalAdmin,
        entity: null,
        entityId: null,
    },
    {
        name: roles.orgAdmin,
        entity: 'organisation',
        entityId: 'test_org_id',
    },
    {
        name: roles.swmsUser,
        entity: null,
        entityId: null,
    },
];

setup({
    appName: 'test',
    userSecretKey: 'DXUEw51uhjXbbxdy4Qm9SPBJE88RnYLC',
    internalServiceSecretKey: 'IkjEIlBVP92JkCFllo9JQeBQwSwiqM1q',
});

describe('authorisationHelper', () => {
    describe('hasRole', () => {
        it('should return true when interal-service role exists', () => {
            const result = hasRole(roleData, roles.internalService);
            expect(result).to.be.true;
        });

        it('should return true when the expected role exists without entity matching', () => {
            const result = hasRole(roleData, roles.portalAdmin);
            expect(result).to.be.true;
        });

        it('should return false when the expected role does not exist', () => {
            const result = hasRole(roleData, 'what user', null, null);
            expect(result).to.be.false;
        });

        it('should return true when the expected role exists and has a matched entity ID', () => {
            const result = hasRole(roleData, roles.orgAdmin, 'organisation', 'test_org_id');
            expect(result).to.be.true;
        });

        it('should return false when the expected role exists but has no matched entity ID', () => {
            const result = hasRole(roleData, roles.orgAdmin, 'organisation', 'different_id');
            expect(result).to.be.false;
        });
    });

    describe('authorise', () => {
        const req = { header: value => (value === 'x-user-jwt' ? testUsers.PORTAL_ADMIN_JWT : null) };
        const res = {};

        it('should call next() if authFunc returns true', () => {
            const authFunc = () => true;
            const next = (error) => {
                expect(!!error).to.be.false;
            };

            authorise(authFunc)(req, res, next);
        });

        it('should call next() with BuildError if authFunc returns false', () => {
            const authFunc = () => false;
            const next = (error) => {
                assertValidationErrorObj(error, builtErrorCodes.ERROR_40301);
            };

            authorise(authFunc)(req, res, next);
        });

        it('should call next() if authFunc returns true using promise', (done) => {
            const authFunc = () => Promise.resolve(true);
            const next = (error) => {
                expect(!!error).to.be.false;
            };

            authorise(authFunc)(req, res, next)
                .then(done, done);
        });

        it('should call next() with BuildError if authFunc returns false using promise', () => {
            const authFunc = () => Promise.resolve(false);
            const next = (error) => {
                assertValidationErrorObj(error, builtErrorCodes.ERROR_40301);
            };

            authorise(authFunc)(req, res, next);
        });
    });
});