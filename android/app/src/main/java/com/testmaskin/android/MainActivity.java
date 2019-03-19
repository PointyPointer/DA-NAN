package com.testmaskin.android;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import java.io.UnsupportedEncodingException;
import java.net.CookieHandler;
import java.net.URLDecoder;
import java.util.LinkedList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final Uri    K_URI  = ContactsContract.Contacts.CONTENT_URI;
    private static final String ID   = ContactsContract.Contacts._ID;
    private static final String NAVN = ContactsContract.Contacts.DISPLAY_NAME;
    private static final String HPN  = ContactsContract.Contacts.HAS_PHONE_NUMBER;

    private static final Uri    TEL_URI  = ContactsContract.CommonDataKinds.Phone.CONTENT_URI;
    private static final String TEL_ID   = ContactsContract.CommonDataKinds.Phone.CONTACT_ID;
    private static final String TEL_NUM  = ContactsContract.CommonDataKinds.Phone.NUMBER;
    private static final String TEL_TYP  = ContactsContract.CommonDataKinds.Phone.TYPE;

    private static final Uri E_URI = ContactsContract.CommonDataKinds.Email.CONTENT_URI;
    private static final String E_ID  = ContactsContract.CommonDataKinds.Email.CONTACT_ID;
    private static final String E_DAT = ContactsContract.CommonDataKinds.Email.DATA;
    private static final String E_TYP = ContactsContract.CommonDataKinds.Email.TYPE;

    WebView wv;
    String cookies = "Not logged in yet";
    private static final String TAG = "Main_activity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar myToolbar = findViewById(R.id.toolbar);
        setSupportActionBar(myToolbar);

        String uri = getIntent().getStringExtra("EXTRA_URI");
        String firstName = "Firstname";
        String lastName = "Lastname";

        Log.d("helge", "onCreate: " +  getUsername("sigurd.holm1@gmail.com"));


        CookieManager.getInstance().setAcceptCookie(true);


        wv = findViewById(R.id.web_view);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.loadUrl(uri);
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished (WebView view, String url) {
                cookies = CookieManager.getInstance().getCookie(url);

                if (CookieManager.getInstance().getCookie(url) != null) {
                    String[] cookieParams = cookies.split(";");
                    String[] cookieValue = cookieParams[1].split("=");
                    cookies = cookieValue[1];

                    try {
                        cookies = URLDecoder.decode(cookies, "UTF-8");
                    } catch (UnsupportedEncodingException e) {
                        Log.e("Yourapp", "UnsupportedEncodingException");
                    }

                    Log.d("mail", cookies);
                }

//                Cursor emails = getContentResolver().query(ContactsContract.Data.CONTENT_URI, null, ContactsContract.CommonDataKinds.Email.ADDRESS + " = " + cookies, null, null);
//                while (emails.moveToNext()) {
//                    String emailAddress = emails.getString(
//                            emails.getColumnIndex(ContactsContract.CommonDataKinds.Email.DATA));
//
//                    Log.i("emails", emailAddress);
//                }
//                emails.close();

                TextView cookie = findViewById(R.id.toolbar_title);
                cookie.setText(cookies);

                Log.d("Cookies", " " + cookies);
            }
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, android.view.KeyEvent event) {

        if (
                keyCode == android.view.KeyEvent.KEYCODE_BACK  &&
                        wv.canGoBack() ) {

            wv.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }



    public String getUsername(String username) {
        String name = null;
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
