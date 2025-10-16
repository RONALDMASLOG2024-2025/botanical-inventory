"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    async function testSupabase() {
      console.log("🧪 Testing Supabase connection...");
      
      const tests: any = {
        clientExists: !!supabase,
        authExists: !!supabase?.auth,
        storageExists: !!supabase?.storage,
        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
        envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
      };

      // Test auth
      try {
        const { error } = await supabase.auth.getSession();
        tests.authTest = error ? `Error: ${error.message}` : "✅ Working";
      } catch (err: any) {
        tests.authTest = `❌ Exception: ${err.message}`;
      }

      // Test database
      try {
        const { data, error } = await supabase.from('plants').select('count');
        tests.databaseTest = error ? `Error: ${error.message}` : "✅ Working";
      } catch (err: any) {
        tests.databaseTest = `❌ Exception: ${err.message}`;
      }

      console.log("🧪 Test results:", tests);
      setDetails(tests);
      setStatus(tests.clientExists && tests.authExists ? "✅ Ready" : "❌ Failed");
    }

    testSupabase();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="bg-white rounded-lg border-2 border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
        
        <div className="space-y-3 font-mono text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-semibold">Check</div>
            <div className="font-semibold">Result</div>
          </div>
          
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-4 border-t pt-2">
              <div className="text-slate-600">{key}</div>
              <div className={
                String(value).includes('✅') ? 'text-green-600' :
                String(value).includes('❌') ? 'text-red-600' :
                'text-slate-900'
              }>
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Open browser console (F12) for detailed logs.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/admin" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Go to Admin Login
        </Link>
        <Link href="/" className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
