package com.testmaskin.android;

import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;


public class MainActivity extends AppCompatActivity {

    private static final Uri    K_URI  = ContactsContract.Contacts.CONTENT_URI;
    private static final String ID   = ContactsContract.Contacts._ID;
    private static final String NAVN = ContactsContract.Contacts.DISPLAY_NAME;

    private static final Uri E_URI = ContactsContract.CommonDataKinds.Email.CONTENT_URI;
    private static final String E_ID  = ContactsContract.CommonDataKinds.Email.CONTACT_ID;
    private static final String E_DAT = ContactsContract.CommonDataKinds.Email.DATA;

    WebView wv;
    String cookies = "Not logged in yet";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar myToolbar = findViewById(R.id.toolbar);
        setSupportActionBar(myToolbar);

//      Get data from previous activity
        String uri = getIntent().getStringExtra("EXTRA_URI");

//      Manage the WebView
        CookieManager.getInstance().setAcceptCookie(true);
        wv = findViewById(R.id.web_view);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.loadUrl(uri);
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished (WebView view, String url) {
                cookies = CookieManager.getInstance().getCookie(url);
                Log.d("raw cookie", ""+cookies);

//              Extract data from cookie
                if (CookieManager.getInstance().getCookie(url) != null) {
                    String[] cookieParams = cookies.split(";");
                    String[] cookieValue = cookieParams[1].split("=");
                    cookies = cookieValue[1];
                    Log.d("mod cookie", ""+cookies);

//                  cookie string is URI encoded, so it needs to be decoded
                    try {
                        cookies = URLDecoder.decode(cookies, "UTF-8");
                    } catch (UnsupportedEncodingException e) {
                        Log.e("Yourapp", "UnsupportedEncodingException");
                    }
//                  Looking through the phone-book for a name based on email
                    cookies = getUsername(cookies);
                    Log.d("mail", ""+cookies);
                }

//              Show the name of the user
                TextView cookie = findViewById(R.id.toolbar_title);
                cookie.setText(cookies);

                Log.d("Cookies", " " + cookies);
            }
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, android.view.KeyEvent event) {
//  makes the back key to go to previous WebView instead of prev activity
        if (
                keyCode == android.view.KeyEvent.KEYCODE_BACK  &&
                        wv.canGoBack() ) {

            wv.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }



    public String getUsername(String username) {
        String name = "Name not found";
        String id;
        String diff;

        Cursor k = getContentResolver().query(K_URI, null, null, null, null);
        if(k.getCount() > 0)
            while(k.moveToNext()) {

                id = k.getString(k.getColumnIndex(ID ));

                Cursor e = getContentResolver().query( E_URI,null ,  E_ID + " = "+ id, null, null);
                while (e.moveToNext()) {
                    diff = e.getString(e.getColumnIndex(E_DAT));

                    if( username.equals(diff)) {
                        name = k.getString(k.getColumnIndex(NAVN));
                    }
                }
                e.close();
            }
        k.close();
        return name;
    }


}
